package base;

import io.github.bonigarcia.wdm.WebDriverManager;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;

import java.net.HttpURLConnection;
import java.net.URL;
import java.time.Duration;

public class BaseTest {

    // WebDriver instance used across test classes
    protected WebDriver driver;

    // Backend health endpoint — used to wake up Render free-tier backend
    // before the browser starts hitting login/API calls
    private static final String BACKEND_HEALTH_URL = "https://ecommerce-app-rttb.onrender.com/api/health";

    @BeforeMethod
    public void setUp() {

        // Wake up the backend first — Render free tier backend and frontend
        // spin up independently, so the frontend can load while the backend
        // is still cold, causing login/API timeouts later in the test
        warmUpBackend();

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
     * Sends a request to the backend health endpoint to trigger Render
     * cold-start spin-up before the browser starts interacting with the app.
     * This prevents login/API timeouts caused by a sleeping backend.
     */
    private void warmUpBackend() {

        try {

            URL url = new URL(BACKEND_HEALTH_URL);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setConnectTimeout(60000);
            connection.setReadTimeout(60000);
            connection.setRequestMethod("GET");

            int responseCode = connection.getResponseCode();
            System.out.println("Backend warm-up ping completed with status: " + responseCode);

        } catch (Exception e) {

            System.out.println("Backend warm-up ping failed: " + e.getMessage());
        }
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