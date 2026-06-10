package base;

import io.github.bonigarcia.wdm.WebDriverManager;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;

public class BaseTest {

    // WebDriver instance used across test classes
    protected WebDriver driver;

    @BeforeMethod
    public void setUp() {

        // Automatically download and configure the compatible ChromeDriver
        WebDriverManager.chromedriver().setup();

        // Launch a new Chrome browser instance
        driver = new ChromeDriver();

        // Maximize the browser window
        driver.manage().window().maximize();

        // Navigate to the E-Commerce application
        driver.get("https://ecommerce-app-1-fnc3.onrender.com");

        System.out.println("Browser launched and application opened successfully.");
    }


    @AfterMethod
    public void tearDown() throws InterruptedException {
        Thread.sleep(10000);

        driver.quit();

        System.out.println("Test execution completed.");
    }
}