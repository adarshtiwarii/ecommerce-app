package pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class LogoutPage {

    private WebDriver driver;

    public LogoutPage(WebDriver driver) {
        this.driver = driver;
    }

    // Profile button
    private By profileButton =
            By.xpath("//div[@class='fixed inset-0 z-40']");

    // Logout button
    private By logoutButton =
            By.xpath("//button[@class='flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-eco-elevated w-full transition-colors border-t border-eco-border']");

    // Open profile menu
    public void openProfileMenu() {

        driver.findElement(profileButton).click();

        System.out.println("Profile menu opened");
    }

    // Logout user
    public void clickLogoutButton() {

        driver.findElement(logoutButton).click();

        System.out.println("Logout button clicked");
    }

    // Logout flow
    public void logout() {

        openProfileMenu();

        clickLogoutButton();

        System.out.println("User logged out");
    }
}