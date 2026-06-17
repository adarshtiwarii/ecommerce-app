package pages;

import org.openqa.selenium.By;
import org.openqa.selenium.ElementClickInterceptedException;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import utils.CommonUtils;

import java.time.Duration;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Locale;

/**
 * Page Object Model class for validating the complete Add to Cart journey.
 * This class uses explicit waits only and keeps every user action reusable.
 */
public class AddToCartPage {

    private final WebDriver driver;
    private final WebDriverWait wait;
    private final CommonUtils commonUtils;

    private final By emailField = By.cssSelector("form input[type='email']");
    private final By passwordField = By.cssSelector("form input[type='password']");
    private final By loginButton = By.xpath("//form//button[@type='submit'][contains(normalize-space(),'Login')]");
    private final By loginTitle = By.xpath("//h1[normalize-space()='Welcome Back']");
    private final By accountButton = By.xpath("//nav//button[.//*[name()='svg'] or contains(normalize-space(),'Account') or contains(normalize-space(),'Login')]");
    private final By splashScreenOverlay = By.xpath("//div[contains(@style,'z-index') and contains(@style,'9999')]");
    private final By productTitle = By.tagName("h1");
    private final By productCards = By.cssSelector("article.card");

    /*
     * Add to Cart button locator from the product details page.
     * If this absolute XPath changes later, prefer adding a stable data-testid in the React button.
     */
    private final By addToCartButton = By.xpath("//*[@id='root']/div/main/div/div/div[2]/div[1]/div[2]/button[1]");

    private final By cartLink = By.xpath("//nav//a[@href='/cart' and .//*[name()='svg']]");
    private final By emptyCartTitle = By.xpath("//*[normalize-space()='Your cart is empty' or contains(normalize-space(),'cart is empty')]");
    private int cartCountBeforeAdd;
    private int cartCountAfterAdd;

    /**
     * Creates the Add to Cart page object.
     *
     * @param driver active WebDriver instance from the test base class
     */
    public AddToCartPage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(30));
        this.commonUtils = new CommonUtils(driver);
    }

    /**
     * Logs in with valid customer credentials before cart actions are executed.
     *
     * @param email valid user email address
     * @param password valid user password
     */
    public void loginWithValidUser(String email, String password) {
        openLoginPage();
        commonUtils.typeText(emailField, email);
        commonUtils.typeText(passwordField, password);
        waitForSplashScreenToDisappear();
        commonUtils.clickWhenReady(loginButton);
        wait.until(driver -> !driver.getCurrentUrl().contains("/login"));
        wait.until(ExpectedConditions.visibilityOfElementLocated(accountButton));
        System.out.println("User logged in successfully.");
    }

    /**
     * Opens a product details page by product name.
     * The test opens the search results route directly, then clicks the matching product card.
     *
     * @param productName visible product name
     */
    public void openProductByName(String productName) {
        String encodedProductName = URLEncoder.encode(productName, StandardCharsets.UTF_8);
        driver.get(getApplicationBaseUrl() + "/search?q=" + encodedProductName);
        waitForSplashScreenToDisappear();
        commonUtils.waitForUrlContains("/search");
        wait.until(ExpectedConditions.numberOfElementsToBeMoreThan(productCards, 0));

        WebElement productCard = findProductCardByName(productName);
        commonUtils.scrollToElement(productCard);
        wait.until(ExpectedConditions.elementToBeClickable(productCard)).click();

        commonUtils.waitForUrlContains("/product/");
        wait.until(ExpectedConditions.visibilityOfElementLocated(productTitle));
        wait.until(ExpectedConditions.presenceOfElementLocated(addToCartButton));
        System.out.println("Product details page opened for product: " + productName);
    }

    /**
     * Clicks the Add to Cart button on the product details page.
     */
    public void clickAddToCartButton() {
        cartCountBeforeAdd = getCartCountFromNavbar();
        WebElement button = findClickableAddToCartButton();
        commonUtils.scrollToElement(button);

        try {
            button.click();
        } catch (ElementClickInterceptedException exception) {
            waitForSplashScreenToDisappear();
            ((JavascriptExecutor) driver).executeScript("arguments[0].click();", button);
        }

        waitForCartCountToIncrease();
        System.out.println("Add to Cart button clicked.");
    }

    /**
     * Verifies that the product was added successfully.
     * The navbar cart count is the primary validation because this React app
     * updates cart state after the add-to-cart API call.
     *
     * @return true when cart count increases or the button displays an added state
     */
    public boolean isSuccessMessageDisplayed() {
        if (cartCountAfterAdd > cartCountBeforeAdd) {
            return true;
        }

        try {
            String buttonText = commonUtils.waitForVisible(addToCartButton).getText();
            return buttonText.contains("Added");
        } catch (TimeoutException exception) {
            return false;
        }
    }

    /**
     * Opens the cart page from the navigation bar.
     */
    public void openCartPage() {
        driver.get(getApplicationBaseUrl() + "/cart");
        waitForSplashScreenToDisappear();
        commonUtils.waitForUrlContains("/cart");
        wait.until(ExpectedConditions.or(
                ExpectedConditions.presenceOfElementLocated(By.cssSelector("article.card")),
                ExpectedConditions.presenceOfElementLocated(emptyCartTitle)
        ));
        System.out.println("Cart page opened.");
    }

    /**
     * Checks whether the selected product is present in the cart.
     *
     * @param productName expected product name
     * @return true when the cart contains the product
     */
    public boolean isSelectedProductPresentInCart(String productName) {
        return commonUtils.retryOnStaleElement(() -> !getCartProductLinks(productName).isEmpty());
    }

    /**
     * Increases product quantity using the plus button.
     *
     * @param productName product name in cart
     */
    public void increaseProductQuantity(String productName) {
        clickCartQuantityButton(productName, "+");
        System.out.println("Product quantity increased.");
    }

    /**
     * Decreases product quantity using the minus button.
     *
     * @param productName product name in cart
     */
    public void decreaseProductQuantity(String productName) {
        clickCartQuantityButton(productName, "-");
        System.out.println("Product quantity decreased.");
    }

    /**
     * Returns the visible quantity for the selected cart product.
     *
     * @param productName product name in cart
     * @return displayed quantity value
     */
    public int getProductQuantity(String productName) {
        return commonUtils.retryOnStaleElement(() -> {
            WebElement quantityControl = findQuantityControl(productName);
            WebElement quantity = quantityControl.findElement(By.xpath("./span[1]"));
            return Integer.parseInt(quantity.getText().trim());
        });
    }

    /**
     * Removes the selected product from the cart.
     *
     * @param productName product name in cart
     */
    // Commented out: remove from cart step disabled for this test run
    /*
    public void removeProductFromCart(String productName) {
        WebElement item = findCartItemByName(productName);
        WebElement removeButton = item.findElement(By.xpath(".//button[contains(normalize-space(),'Remove')]"));
        commonUtils.scrollToElement(removeButton);
        wait.until(ExpectedConditions.elementToBeClickable(removeButton)).click();
        waitUntilProductIsRemoved(productName);
        System.out.println("Product removed from cart.");
    }
    */

    /**
     * Verifies that a specific product is no longer available in the cart.
     *
     * @param productName removed product name
     * @return true when the product is absent from the cart
     */
    public boolean isProductRemovedFromCart(String productName) {
        try {
            waitUntilProductIsRemoved(productName);
            return true;
        } catch (TimeoutException exception) {
            return false;
        }
    }

    /**
     * Verifies that the cart is empty after product removal.
     *
     * @return true when the empty cart state is visible
     */
    public boolean isCartEmpty() {
        try {
            wait.until(ExpectedConditions.visibilityOfElementLocated(emptyCartTitle));
            return true;
        } catch (TimeoutException exception) {
            return false;
        }
    }

    /**
     * Waits until the navbar cart count increases after adding a product.
     */
    private void waitForCartCountToIncrease() {
        try {
            wait.until(driver -> {
                cartCountAfterAdd = getCartCountFromNavbar();
                return cartCountAfterAdd > cartCountBeforeAdd;
            });
        } catch (TimeoutException exception) {
            cartCountAfterAdd = getCartCountFromNavbar();
            System.out.println("Cart count did not increase within wait time. Current cart count: " + cartCountAfterAdd);
        }
    }

    /**
     * Waits until a removed product disappears from the cart.
     * This is better than checking that the full cart is empty because the
     * customer account may already contain other cart items.
     *
     * @param productName removed product name
     */
    private void waitUntilProductIsRemoved(String productName) {
        wait.until(driver -> getCartProductLinks(productName).isEmpty());
    }

    /**
     * Finds the visible and enabled Add to Cart button on the product details page.
     * The locator is scoped to the main product image panel to avoid related product cards.
     *
     * @return clickable Add to Cart button
     */
    private WebElement findClickableAddToCartButton() {
        return wait.until(driver -> {
            List<WebElement> buttons = driver.findElements(addToCartButton);

            for (WebElement button : buttons) {
                if (button.isDisplayed() && button.isEnabled()) {
                    return button;
                }
            }

            return null;
        });
    }

    /**
     * Reads the numeric cart count from the navbar.
     *
     * @return current cart count, or zero when no badge is visible
     */
    private int getCartCountFromNavbar() {
        try {
            String cartText = commonUtils.waitForVisible(cartLink).getText().replace("+", "");
            String countText = cartText.replaceAll("[^0-9]", "");

            if (countText.isEmpty()) {
                return 0;
            }

            return Integer.parseInt(countText);
        } catch (Exception exception) {
            return 0;
        }
    }

    /**
     * Opens the login page and waits until the login form is fully rendered.
     * A navbar fallback is used because deployed React routes can briefly show
     * the shell before the login page mounts.
     */
    private void openLoginPage() {
        String loginUrl = getApplicationBaseUrl() + "/login";
        openLoginRoute(loginUrl);

        System.out.println("Login page opened successfully: " + driver.getCurrentUrl());
    }

    /**
     * Opens the direct login route and retries once if React route rendering is delayed.
     * This avoids brittle navbar dropdown clicks while the splash screen or menu state changes.
     *
     * @param loginUrl direct login page URL
     */
    private void openLoginRoute(String loginUrl) {
        try {
            driver.get(loginUrl);
            waitForSplashScreenToDisappear();
            waitForLoginForm();
        } catch (TimeoutException exception) {
            navigateToLoginWithReactRouter();
            waitForSplashScreenToDisappear();
            waitForLoginForm();
        }
    }

    /**
     * Moves the React single page application to the login route when direct
     * browser navigation remains on the home page.
     */
    private void navigateToLoginWithReactRouter() {
        ((JavascriptExecutor) driver).executeScript(
                "window.history.pushState({}, '', '/login');" +
                        "window.dispatchEvent(new PopStateEvent('popstate'));"
        );
    }

    /**
     * Waits until the React splash screen overlay is removed or becomes non-blocking.
     * This prevents ElementClickInterceptedException when the fixed loader covers the page.
     */
    private void waitForSplashScreenToDisappear() {
        try {
            wait.until(ExpectedConditions.invisibilityOfElementLocated(splashScreenOverlay));
        } catch (TimeoutException exception) {
            System.out.println("Splash screen did not disappear within wait time. Continuing with normal element waits.");
        }
    }

    /**
     * Waits for the login page URL and all required form controls.
     */
    private void waitForLoginForm() {
        commonUtils.waitForUrlContains("/login");
        wait.until(ExpectedConditions.visibilityOfElementLocated(loginTitle));
        wait.until(ExpectedConditions.visibilityOfElementLocated(emailField));
        wait.until(ExpectedConditions.visibilityOfElementLocated(passwordField));
        wait.until(ExpectedConditions.elementToBeClickable(loginButton));
    }

    /**
     * Clicks either the plus or minus quantity button for a cart item.
     *
     * @param productName product name in cart
     * @param buttonText visible button text, either + or -
     */
    private void clickCartQuantityButton(String productName, String buttonText) {
        int currentQuantity = getProductQuantity(productName);
        WebElement quantityControl = findQuantityControl(productName);
        List<WebElement> quantityButtons = quantityControl.findElements(By.xpath("./button"));
        WebElement quantityButton = "+".equals(buttonText)
                ? quantityButtons.get(1)
                : quantityButtons.get(0);
        commonUtils.scrollToElement(quantityButton);
        wait.until(ExpectedConditions.elementToBeClickable(quantityButton)).click();

        int expectedQuantity = "+".equals(buttonText)
                ? currentQuantity + 1
                : Math.max(1, currentQuantity - 1);

        wait.until(driver -> getProductQuantity(productName) == expectedQuantity);
    }

    /**
     * Finds the cart quantity control for a product.
     * The minus and plus controls are icon-only buttons, so this method uses
     * their stable structure: button, quantity span, button.
     *
     * @param productName product name in cart
     * @return quantity control element containing minus button, quantity, and plus button
     */
    private WebElement findQuantityControl(String productName) {
        WebElement item = findCartItemByName(productName);
        return item.findElement(By.xpath(".//div[count(./button)=2 and count(./span)=1]"));
    }

    /**
     * Finds a product card by product name on the search results page.
     *
     * @param productName expected product name
     * @return matching product card
     */
    private WebElement findProductCardByName(String productName) {
        return commonUtils.retryOnStaleElement(() -> {
            List<WebElement> cards = driver.findElements(productCards);
            String expectedName = productName.toLowerCase(Locale.ROOT);

            for (WebElement card : cards) {
                if (card.getText().toLowerCase(Locale.ROOT).contains(expectedName)) {
                    return card;
                }
            }

            throw new TimeoutException("Product was not found in search results: " + productName);
        });
    }

    /**
     * Finds a cart item by product name.
     *
     * @param productName expected product name
     * @return matching cart item article
     */
    private WebElement findCartItemByName(String productName) {
        return commonUtils.retryOnStaleElement(() -> {
            List<WebElement> items = driver.findElements(By.cssSelector("article.card"));
            String expectedName = productName.toLowerCase(Locale.ROOT);

            for (WebElement item : items) {
                if (item.getText().toLowerCase(Locale.ROOT).contains(expectedName)) {
                    return item;
                }
            }

            throw new TimeoutException("Product was not found in cart: " + productName);
        });
    }

    /**
     * Returns cart product links matching the expected product name.
     *
     * @param productName expected product name
     * @return matching links
     */
    private List<WebElement> getCartProductLinks(String productName) {
        return driver.findElements(By.xpath(
                "//article[contains(@class,'card')]//a[contains(normalize-space(),\"" + escapeForXpath(productName) + "\")]"
        ));
    }

    /**
     * Returns the current application base URL without any route path.
     *
     * @return base application URL
     */
    private String getApplicationBaseUrl() {
        String currentUrl = driver.getCurrentUrl();
        return currentUrl
                .replaceAll("(/login|/search.*|/product/.*|/cart).*$", "")
                .replaceAll("/+$", "");
    }

    /**
     * Escapes double quotes for simple XPath contains expressions.
     *
     * @param value dynamic text used in XPath
     * @return escaped text value
     */
    private String escapeForXpath(String value) {
        return value.replace("\"", "\\\"");
    }
}