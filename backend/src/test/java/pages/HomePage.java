package pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

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
}