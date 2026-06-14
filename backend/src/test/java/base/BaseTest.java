package base;

import io.github.bonigarcia.wdm.WebDriverManager;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;

import java.time.Duration;

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

        // Render free tier spins up in 30-90 seconds on first request
        // pageLoadTimeout set high so browser does not give up early
        driver.manage().timeouts().pageLoadTimeout(Duration.ofSeconds(120));

        // Navigate to the deployed application
        driver.get("https://ecommerce-app-1-fnc3.onrender.com");

        // Wait until Render finishes spin-up and actual app is rendered
        // Navbar search input is only present after React mounts successfully
        waitForAppToLoad();

        System.out.println("Browser launched and application opened successfully.");
    }

    /**
     * Waits until the React app fully loads after Render spin-up.
     * Render free tier shows a blank/loading page before redirecting
     * to the actual app. This method retries until the navbar appears.
     */
    private void waitForAppToLoad() {

        // 120 seconds total wait to handle Render cold start
        WebDriverWait appLoadWait = new WebDriverWait(driver, Duration.ofSeconds(120));

        // Navbar search input is a reliable indicator that React has mounted
        By searchInput = By.xpath("//input[contains(@placeholder,'Search products')]");

        try {

            appLoadWait.until(
                    ExpectedConditions.visibilityOfElementLocated(searchInput)
            );

            System.out.println("Application loaded successfully after Render spin-up.");

        } catch (Exception e) {

            System.out.println("App load wait timed out. Proceeding anyway: " + e.getMessage());
        }
    }

    @AfterMethod
    public void tearDown() {

        // Small pause so last page state is visible before browser closes
        try {
            Thread.sleep(3000); // reduced from 10000 — 10 sec wait unnecessary
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        driver.quit();

        System.out.println("Test execution completed.");
    }
}