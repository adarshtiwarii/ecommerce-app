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

    // Email field
    private By emailField =
            By.xpath("//input[@placeholder='Email Address']");

    // Password field
    private By passwordField =
            By.xpath("//input[@placeholder='Password']");

    // Login button
    private By loginButton =
            By.xpath("//button[@type='submit'][normalize-space()='Login']");

    // Error message
    private By errorMessage =
            By.xpath("//*[@id=\"root\"]/div/main/div/div[2]/div[4]");

    // Profile button after login
    private By postLoginElement =
            By.xpath("//*[@id='root']/div/nav[1]/div[1]/div[1]/div/div/button");

    // Enter email
    public void enterEmail(String email) {

        WebDriverWait wait =
                new WebDriverWait(driver, Duration.ofSeconds(10));

        wait.until(
                ExpectedConditions.visibilityOfElementLocated(emailField)
        );

        driver.findElement(emailField).sendKeys(email);

        System.out.println("Email Entered: " + email);
    }

    // Enter password
    public void enterPassword(String password) {

        driver.findElement(passwordField).sendKeys(password);

        System.out.println("Password Entered");
    }

    // Click login button
    public void clickLoginButton() {

        WebDriverWait wait =
                new WebDriverWait(driver, Duration.ofSeconds(10));

        wait.until(
                ExpectedConditions.elementToBeClickable(loginButton)
        );

        driver.findElement(loginButton).click();

        System.out.println("Login Button Clicked");
    }

    // Get error message
    public String getErrorMessage() {

        WebDriverWait wait =
                new WebDriverWait(driver, Duration.ofSeconds(5));

        try {

            wait.until(
                    ExpectedConditions.visibilityOfElementLocated(errorMessage)
            );

            String msg =
                    driver.findElement(errorMessage).getText().trim();

            if (!msg.isEmpty()) {

                System.out.println("Error Message: " + msg);

                return msg;
            }

        } catch (Exception ignored) {
        }

        try {

            By popupMsg = By.xpath(
                    "//div[contains(@style,'rgba(0,0,0')]//p[contains(@class,'font-semibold')]"
            );

            List<WebElement> popups =
                    driver.findElements(popupMsg);

            for (WebElement el : popups) {

                String msg = el.getText().trim();

                if (!msg.isEmpty()) {

                    System.out.println("Error Message: " + msg);

                    return msg;
                }
            }

        } catch (Exception ignored) {
        }

        try {

            By inlineError = By.xpath(
                    "//p[contains(@class,'text-red-4') or contains(@class,'text-red-5')]"
            );

            List<WebElement> inlineErrors =
                    driver.findElements(inlineError);

            for (WebElement el : inlineErrors) {

                String msg = el.getText().trim();

                if (!msg.isEmpty()) {

                    System.out.println("Error Message: " + msg);

                    return msg;
                }
            }

        } catch (Exception ignored) {
        }

        System.out.println("Error Message: (none found)");

        return "";
    }

    // Verify login
    public boolean isLoginSuccessful() {

        try {

            WebDriverWait wait =
                    new WebDriverWait(driver, Duration.ofSeconds(10));

            wait.until(
                    ExpectedConditions.visibilityOfElementLocated(postLoginElement)
            );

            System.out.println("Login successful");

            return true;

        } catch (Exception e) {

            System.out.println("Login failed");

            return false;
        }
    }

    // Login
    public void login(String email, String password) {

        enterEmail(email);

        enterPassword(password);

        clickLoginButton();
    }

    // Login as user
    public void loginAsUser() {

        login(
                "ashu23@gmail.com",
                "Adarsh@123"
        );
    }

    // Login as admin
    public void loginAsAdmin() {

        login(
                "adarsht072@gmail.com",
                "Adarsh@875579"
        );
    }
}