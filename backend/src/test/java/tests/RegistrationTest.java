package tests;

import base.BaseTest;
import org.testng.annotations.Test;
import pages.HomePage;
import pages.RegistrationPage;

public class RegistrationTest extends BaseTest {

    @Test
    public void verifyRegistration() throws InterruptedException {

        HomePage homePage = new HomePage(driver);

        // Open registration page
        homePage.openRegistrationPage();

        RegistrationPage registrationPage =
                new RegistrationPage(driver);

        registrationPage.enterFullName("Sita");

        registrationPage.enterEmail("sita123@gmail.com");

        registrationPage.enterPhoneNumber("9936273045");

        registrationPage.selectMale();

        registrationPage.enterPassword("Sita@123");

        registrationPage.enterConfirmPassword("Sita@123");

        registrationPage.clickRegisterButton();

        Thread.sleep(5000);
    }
}