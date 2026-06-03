package pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.Select;

public class RegistrationPage {

    private WebDriver driver;

    // Constructor
    public RegistrationPage(WebDriver driver) {
        this.driver = driver;
    }

    // Full Name locator
    private By fullName = By.xpath("//input[@placeholder='Full Name']");

    // Email locator
    private By email = By.xpath("//input[@placeholder='Email']");

    // Phone Number locator
    private By phoneNumber = By.xpath("//input[@placeholder='Phone Number (10 digits)']");

    // Gender dropdown locator
    private By genderDropdown = By.xpath("//select[@class='w-full rounded-2xl border border-white/[0.08] bg-[#161616] px-4 py-3 text-sm text-white shadow-sm outline-none transition focus:border-[#FF6B00] focus:ring-4 focus:ring-[rgba(255,107,0,0.18)]']");

    // Password locator
    private By password = By.xpath("//input[@placeholder='Password (min 6 characters)']");

    // Confirm Password locator
    private By confirmPassword = By.xpath("//input[@placeholder='Confirm Password']");

    // Register Button locator
    private By registerButton = By.xpath("//button[normalize-space()='Register']");

    // Enter Full Name
    public void enterFullName(String name) {
        driver.findElement(fullName).sendKeys(name);
    }

    // Enter Email Address
    public void enterEmail(String emailAddress) {
        driver.findElement(email).sendKeys(emailAddress);
    }

    // Enter Phone Number
    public void enterPhoneNumber(String phone) {
        driver.findElement(phoneNumber).sendKeys(phone);
    }

    // Select Male Gender
    public void selectMale() {
        Select gender = new Select(driver.findElement(genderDropdown));
        gender.selectByVisibleText("Male");
    }

    // Select Female Gender
    public void selectFemale() {
        Select gender = new Select(driver.findElement(genderDropdown));
        gender.selectByVisibleText("Female");
    }

    // Select Other Gender
    public void selectOther() {
        Select gender = new Select(driver.findElement(genderDropdown));
        gender.selectByVisibleText("Other");
    }

    // Enter Password
    public void enterPassword(String pwd) {
        driver.findElement(password).sendKeys(pwd);
    }

    // Enter Confirm Password
    public void enterConfirmPassword(String confirmPwd) {
        driver.findElement(confirmPassword).sendKeys(confirmPwd);
    }

    // Click Register Button
    public void clickRegisterButton() {
        driver.findElement(registerButton).click();
    }
}