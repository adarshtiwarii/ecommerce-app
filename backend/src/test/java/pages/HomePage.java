package pages;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public class HomePage {

    private WebDriver driver;

    public HomePage(WebDriver driver) {
        this.driver = driver;
    }

    // Profile/User button
    private By profileButton =
            By.xpath("//*[@id='root']/div/nav[1]/div[1]/div[1]/div/div/button");

    // Create Account option
    private By createAccountButton =
            By.xpath("//*[contains(text(),'Create Account')]");

    // Login option
    private By loginButton =
            By.xpath("//*[@id='root']/div/nav[1]/div[1]/div[1]/div/div/div/div/a[2]");

    // Logout option
    private By logoutButton =
            By.xpath("//*[contains(text(),'Logout')]");

    // All category button
    private By all =
            By.xpath("//*[@id='root']/div/main/div/div/div/button[1]");

    // Open registration page
    public void openRegistrationPage() throws InterruptedException {

        Thread.sleep(10000);

        driver.findElement(profileButton).click();

        Thread.sleep(2000);

        driver.findElement(createAccountButton).click();

        Thread.sleep(3000);
    }

    // Open login page
    public void openLoginPage() throws InterruptedException {

        Thread.sleep(10000);

        driver.findElement(profileButton).click();

        System.out.println("Profile button clicked");

        Thread.sleep(2000);

        driver.findElement(loginButton).click();

        System.out.println("Login option clicked");

        Thread.sleep(3000);
    }

    // Open profile menu
    public void openProfileMenu() throws InterruptedException {

        driver.findElement(profileButton).click();

        Thread.sleep(2000);

        System.out.println("Profile menu opened");
    }

    // Logout user
    public void clickLogout() {

        driver.findElement(logoutButton).click();

        System.out.println("Logout clicked");
    }

    // Open product listing
    public void clickForYou() throws InterruptedException {

        Thread.sleep(5000);

        WebElement allButton =
                driver.findElement(all);

        JavascriptExecutor js =
                (JavascriptExecutor) driver;

        js.executeScript(
                "arguments[0].scrollIntoView({block:'center'});",
                allButton
        );

        Thread.sleep(1000);

        js.executeScript(
                "arguments[0].click();",
                allButton
        );

        System.out.println("All tab clicked");

        Thread.sleep(5000);
    }
}