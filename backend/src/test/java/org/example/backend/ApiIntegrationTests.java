package org.example.backend;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.backend.model.Product;
import org.example.backend.model.User;
import org.example.backend.repository.OrderItemRepository;
import org.example.backend.repository.OrderRepository;
import org.example.backend.repository.ProductRepository;
import org.example.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.Map;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ApiIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @BeforeEach
    void setUp() {
        orderItemRepository.deleteAll();
        orderRepository.deleteAll();
        productRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void healthAndPublicProductsAreReachableWithoutLogin() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value("ok"));

        mockMvc.perform(get("/api/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }

    @Test
    void renderFrontendOriginCanPassCorsPreflight() throws Exception {
        mockMvc.perform(options("/api/auth/login")
                        .header("Origin", "https://ecommerce-app-1-fnc3.onrender.com")
                        .header("Access-Control-Request-Method", "POST"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "https://ecommerce-app-1-fnc3.onrender.com"));
    }

    @Test
    void registerAndLoginReturnUsableCustomerResponsesWithoutPasswordHash() throws Exception {
        Map<String, Object> registration = Map.of(
                "fullName", "Customer One",
                "email", "customer@example.com",
                "phoneNumber", "9876543210",
                "password", "Secret123",
                "confirmPassword", "Secret123",
                "gender", "OTHER"
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registration)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("customer@example.com"))
                .andExpect(jsonPath("$.role").value("CUSTOMER"))
                .andExpect(jsonPath("$.passwordHash").doesNotExist());

        Map<String, Object> login = Map.of(
                "emailOrPhone", "customer@example.com",
                "password", "Secret123",
                "rememberMe", false
        );

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andExpect(cookie().exists("ECOM_AUTH"))
                .andExpect(jsonPath("$.message").value("Login successful"))
                .andExpect(jsonPath("$.role").value("CUSTOMER"))
                .andExpect(jsonPath("$.token", not("")))
                .andExpect(jsonPath("$.userId").isNumber());
    }

    @Test
    void protectedAndAdminEndpointsRejectMissingOrInsufficientAuth() throws Exception {
        mockMvc.perform(get("/api/cart").param("userId", "1"))
                .andExpect(status().isUnauthorized());

        String customerToken = createUserAndLogin("customer@example.com", "9876543210", User.Role.CUSTOMER);

        mockMvc.perform(get("/api/auth/users")
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void adminCanAccessAdminApiWithJwt() throws Exception {
        String adminToken = createUserAndLogin("admin@example.com", "9876543211", User.Role.ADMIN);

        mockMvc.perform(get("/api/auth/users")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].passwordHash").doesNotExist());
    }

    @Test
    void adminStatusChangeIsVisibleInCustomerOrders() throws Exception {
        String customerToken = createUserAndLogin("customer@example.com", "9876543210", User.Role.CUSTOMER);
        String adminToken = createUserAndLogin("admin@example.com", "9876543211", User.Role.ADMIN);
        Long customerId = userRepository.findByEmail("customer@example.com").orElseThrow().getUserId();
        Long productId = createProduct().getId();

        Map<String, Object> orderPayload = Map.of(
                "userId", customerId,
                "shippingAddress", "123 Test Street, Mumbai, MH - 400001",
                "paymentMethod", "COD",
                "items", java.util.List.of(Map.of(
                        "productId", productId,
                        "quantity", 1
                ))
        );

        String placeOrderResponse = mockMvc.perform(post("/api/orders")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(orderPayload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andReturn()
                .getResponse()
                .getContentAsString();
        Long orderId = objectMapper.readTree(placeOrderResponse).get("orderId").asLong();

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch("/api/orders/admin/{id}/status", orderId)
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("status", "CONFIRMED"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CONFIRMED"));

        mockMvc.perform(get("/api/orders/my")
                        .header("Authorization", "Bearer " + customerToken)
                        .param("userId", String.valueOf(customerId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].orderId").value(orderId))
                .andExpect(jsonPath("$[0].status").value("CONFIRMED"));
    }

    @Test
    void removedHardcodedBootstrapEndpointsAreNotPublicBackdoors() throws Exception {
        mockMvc.perform(post("/api/auth/create-admin"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(post("/api/auth/create-seller"))
                .andExpect(status().isUnauthorized());
    }

    private String createUserAndLogin(String email, String phone, User.Role role) throws Exception {
        User user = new User();
        user.setFullName(role.name() + " Test");
        user.setEmail(email);
        user.setPhoneNumber(phone);
        user.setPasswordHash(passwordEncoder.encode("Secret123"));
        user.setRole(role);
        user.setGender(User.Gender.OTHER);
        user.setEnabled(true);
        userRepository.save(user);

        Map<String, Object> login = Map.of(
                "emailOrPhone", email,
                "password", "Secret123",
                "rememberMe", false
        );

        String response = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", containsString(".")))
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode body = objectMapper.readTree(response);
        return body.get("token").asText();
    }

    private Product createProduct() {
        Product product = new Product();
        product.setName("Integration Test Product");
        product.setDescription("Product used for order integration testing");
        product.setPrice(BigDecimal.valueOf(499));
        product.setStockQuantity(10);
        product.setImageUrl("https://example.com/product.png");
        product.setCategory("Testing");
        product.setSellerId(1L);
        product.setEnabled(true);
        return productRepository.save(product);
    }
}
