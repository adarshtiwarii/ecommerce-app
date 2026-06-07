package tests;

import io.github.bonigarcia.wdm.WebDriverManager;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.testng.Assert;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;
import pages.HomePage;
import pages.LoginPage;

public class LoginTest {

    private WebDriver driver;
    private HomePage homePage;
    private LoginPage loginPage;

    private static final String BASE_URL =
            "https://ecommerce-app-1-fnc3.onrender.com";

    @BeforeMethod
    public void setUp() {

        WebDriverManager.chromedriver().setup();

        driver = new ChromeDriver();

        driver.manage().window().maximize();

        driver.get(BASE_URL);

        System.out.println("Browser launched and application opened successfully.");

        homePage = new HomePage(driver);

        loginPage = new LoginPage(driver);
    }

    // Valid Login
    @Test(priority = 1)
    public void verifySuccessfulLogin() throws InterruptedException {

        homePage.openLoginPage();

        loginPage.enterEmail("ashu23@gmail.com");

        loginPage.enterPassword("Adarsh@123");

        loginPage.clickLoginButton();

        Thread.sleep(5000);

        Assert.assertTrue(
                loginPage.isLoginSuccessful(),
                "Login should succeed with valid credentials."
        );

        System.out.println("Successful login test passed.");
    }

    // Invalid Login
    @Test(priority = 2)
    public void verifyLoginWithWrongPassword() throws InterruptedException {

        homePage.openLoginPage();

        loginPage.enterEmail("adarsht072@gmail.com");

        loginPage.enterPassword("WrongPassword123");

        loginPage.clickLoginButton();

        Thread.sleep(3000);

        String error = loginPage.getErrorMessage();

        Assert.assertFalse(
                error.isEmpty(),
                "Error message should be displayed."
        );

        System.out.println("Wrong password test passed.");
    }

    // Assertion
    @Test(priority = 3)
    public void verifyLoginPageTitle() {

        String actualTitle = driver.getTitle();

        Assert.assertFalse(
                actualTitle.isEmpty(),
                "Page title should not be empty."
        );

        System.out.println("Page title verified successfully.");
    }

    @AfterMethod
    public void tearDown() {

        if (driver != null) {

            driver.quit();

            System.out.println("Test execution completed.");
        }
    }
}