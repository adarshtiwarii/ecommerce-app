package pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.interactions.Actions;


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

    // Login option inside dropdown
    private By loginButton =
            By.xpath("//*[@id='root']/div/nav[1]/div[1]/div[1]/div/div/div/div/a[2]");


    // Open registration page
    public void openRegistrationPage() throws InterruptedException {

        // Wait for splash screen to disappear
        Thread.sleep(10000);

        // Click profile button
        driver.findElement(profileButton).click();

        Thread.sleep(2000);

        // Click Create Account
        driver.findElement(createAccountButton).click();

        Thread.sleep(3000);
    }
    public void openLoginPage() throws InterruptedException {

        // Wait for splash screen to disappear
        Thread.sleep(10000);

        // Click profile/login button
        driver.findElement(profileButton).click();

        System.out.println("Profile button clicked");

        Thread.sleep(2000);

        // Click Login option from dropdown
        driver.findElement(loginButton).click();

        System.out.println("Login option clicked");

        Thread.sleep(3000);
    }

}