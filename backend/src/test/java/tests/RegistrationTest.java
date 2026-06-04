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

        registrationPage.enterFullName("Ram");

        registrationPage.enterEmail("ram36@gmail.com");

        registrationPage.enterPhoneNumber("9936273745");

        registrationPage.selectMale();

        registrationPage.enterPassword("Ram@995652");

        registrationPage.enterConfirmPassword("Ram@995652");

        registrationPage.clickRegisterButton();

        Thread.sleep(5000);
    }
}