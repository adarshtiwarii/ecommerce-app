package pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;
import java.util.List;

public class LoginPage {

    private WebDriver driver;

    // Constructor
    public LoginPage(WebDriver driver) {
        this.driver = driver;
    }

    // ── Locators ──────────────────────────────────────────────────────────────

    // Email input field on the login form
    private By emailField = By.xpath("//input[@placeholder='Email Address']");

    // Password input field on the login form
    private By passwordField = By.xpath("//input[@placeholder='Password']");

    // Login submit button
    private By loginButton = By.xpath("//button[@type='submit'][normalize-space()='Login']");

    // Error message shown when login fails (wrong credentials)
    private By errorMessage = By.xpath(
            "//div[contains(@class,'text-red-700') or contains(@class,'bg-red-50')]"
    );

    // Success indicator after login — navbar profile icon or user name
    // Update this XPath to match your post-login UI element
    private By postLoginElement = By.xpath(
            "//*[@id='root']/div/nav[1]/div[1]/div[1]/div/div/button"
    );

    // ── Action Methods ────────────────────────────────────────────────────────

    // Enter email — waits for field to be visible before typing
    public void enterEmail(String email) {
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        wait.until(ExpectedConditions.visibilityOfElementLocated(emailField));
        driver.findElement(emailField).sendKeys(email);
        System.out.println("Email Entered: " + email);
    }

    // Enter password
    public void enterPassword(String password) {
        driver.findElement(passwordField).sendKeys(password);
        System.out.println("Password Entered");
    }

    // Click the Login button — waits until it is clickable
    public void clickLoginButton() {
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        wait.until(ExpectedConditions.elementToBeClickable(loginButton));
        driver.findElement(loginButton).click();
        System.out.println("Login Button Clicked");
    }

    // Returns the error message text shown after a failed login attempt.
    //
    // CHANGED METHOD — previous version only checked one location (errorMessage locator)
    // and threw TimeoutException if the backend red box did not appear.
    //
    // Now checks 3 locations in order so any type of error is caught:
    //   Location 1 — Global red error box (backend error e.g. "Invalid email or password")
    //                Uses the original errorMessage locator — no locator change.
    //   Location 2 — Large ValidationPopup message (shown for empty fields / bad format)
    //                This is the popup added in LoginPage.jsx with a dark overlay.
    //   Location 3 — Small inline red text shown below each input field on blur.
    // Returns the first non-empty message found, or empty string if none found.
    public String getErrorMessage() {
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(5));

        // Location 1: original global red error box (same locator as before — unchanged)
        try {
            wait.until(ExpectedConditions.visibilityOfElementLocated(errorMessage));
            String msg = driver.findElement(errorMessage).getText().trim();
            if (!msg.isEmpty()) {
                System.out.println("Error Message: " + msg);
                return msg;
            }
        } catch (Exception ignored) {
            // Not found — try next location
        }

        // Location 2: large ValidationPopup — dark overlay with a white card
        // Targets the main message paragraph inside the popup card
        try {
            By popupMsg = By.xpath(
                    "//div[contains(@style,'rgba(0,0,0')]//p[contains(@class,'font-semibold')]"
            );
            List<WebElement> popups = driver.findElements(popupMsg);
            for (WebElement el : popups) {
                String msg = el.getText().trim();
                if (!msg.isEmpty()) {
                    System.out.println("Error Message: " + msg);
                    return msg;
                }
            }
        } catch (Exception ignored) {
            // Not found — try next location
        }

        // Location 3: small inline red error shown below an input field on blur
        try {
            By inlineError = By.xpath(
                    "//p[contains(@class,'text-red-4') or contains(@class,'text-red-5')]"
            );
            List<WebElement> inlineErrors = driver.findElements(inlineError);
            for (WebElement el : inlineErrors) {
                String msg = el.getText().trim();
                if (!msg.isEmpty()) {
                    System.out.println("Error Message: " + msg);
                    return msg;
                }
            }
        } catch (Exception ignored) {
            // Not found in any location
        }

        // No error found anywhere on the page
        System.out.println("Error Message: (none found)");
        return "";
    }

    // Returns true if login was successful by checking for a post-login element
    public boolean isLoginSuccessful() {
        try {
            WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
            wait.until(ExpectedConditions.visibilityOfElementLocated(postLoginElement));
            System.out.println("Login successful — post-login element found.");
            return true;
        } catch (Exception e) {
            System.out.println("Login failed — post-login element not found.");
            return false;
        }
    }
}