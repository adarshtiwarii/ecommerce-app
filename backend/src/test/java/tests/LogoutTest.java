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

        // Open login page
        homePage.openLoginPage();

        // Login as user
        loginPage.loginAsUser();

        Thread.sleep(5000);

        Assert.assertTrue(
                loginPage.isLoginSuccessful(),
                "Login should be successful."
        );

        System.out.println("Login Successful");

        // Open profile menu
        homePage.openProfileMenu();

        // Logout user
        homePage.clickLogout();

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

        // Open login page
        homePage.openLoginPage();

        // Login as user
        loginPage.loginAsUser();

        Thread.sleep(5000);

        // Open profile menu
        homePage.openProfileMenu();

        // Logout user
        homePage.clickLogout();

        Thread.sleep(3000);

        // Browser back
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

    @Test(priority = 3)
    public void verifyAdminLogout() throws InterruptedException {

        HomePage homePage = new HomePage(driver);
        LoginPage loginPage = new LoginPage(driver);

        // Open login page
        homePage.openLoginPage();

        // Login as admin
        loginPage.loginAsAdmin();

        Thread.sleep(5000);

        Assert.assertTrue(
                loginPage.isLoginSuccessful(),
                "Admin login should be successful."
        );

        // Open profile menu
        homePage.openProfileMenu();

        // Logout admin
        homePage.clickLogout();

        Thread.sleep(3000);

        Assert.assertTrue(
                driver.findElement(
                        By.xpath("//*[contains(text(),'Login')]")
                ).isDisplayed(),
                "Admin logout failed."
        );

        System.out.println("Admin Logout Successful");
    }
}