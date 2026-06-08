package tests;

import base.BaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;
import pages.HomePage;
import pages.LoginPage;

public class LogoutTest extends BaseTest {

    @Test(priority = 1)
    public void verifyLogout() throws InterruptedException {

        HomePage homePage = new HomePage(driver);
        LoginPage loginPage = new LoginPage(driver);

        // Open Login Page
        homePage.openLoginPage();

        // Login
        loginPage.enterEmail("ashu23@gmail.com");
        loginPage.enterPassword("Adarsh@123");
        loginPage.clickLoginButton();

        Thread.sleep(5000);

        Assert.assertTrue(
                loginPage.isLoginSuccessful(),
                "Login should be successful."
        );

        System.out.println("Login Successful");

        // Click Profile Button
        driver.findElement(
                By.xpath("//*[@id='root']/div/nav[1]/div[1]/div[1]/div/div/button")
        ).click();

        Thread.sleep(2000);

        // Click Logout
        driver.findElement(
                By.xpath("//*[contains(text(),'Logout')]")
        ).click();

        Thread.sleep(3000);

        Assert.assertTrue(
                driver.findElement(
                        By.xpath("//*[contains(text(),'Login')]")
                ).isDisplayed(),
                "Logout failed."
        );

        System.out.println("Logout Successful");
    }

    @Test(priority = 2)
    public void verifySessionHandling() throws InterruptedException {

        HomePage homePage = new HomePage(driver);
        LoginPage loginPage = new LoginPage(driver);

        // Login
        homePage.openLoginPage();

        loginPage.enterEmail("ashu23@gmail.com");
        loginPage.enterPassword("Adarsh@123");
        loginPage.clickLoginButton();

        Thread.sleep(5000);

        // Logout
        driver.findElement(
                By.xpath("//*[@id='root']/div/nav[1]/div[1]/div[1]/div/div/button")
        ).click();

        Thread.sleep(2000);

        driver.findElement(
                By.xpath("//*[contains(text(),'Logout')]")
        ).click();

        Thread.sleep(3000);

        // Browser Back
        driver.navigate().back();

        Thread.sleep(3000);

        Assert.assertTrue(
                driver.findElement(
                        By.xpath("//*[contains(text(),'Login')]")
                ).isDisplayed(),
                "Session handling failed."
        );

        System.out.println("Session Handling Verified Successfully");
    }
}