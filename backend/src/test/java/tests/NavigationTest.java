package tests;

import base.BaseTest;
import org.testng.annotations.Test;

public class NavigationTest extends BaseTest {

    @Test
    public void verifyNavigation() throws InterruptedException {

        // Application URL is already opened from BaseTest
        System.out.println("Application Opened Successfully");

        Thread.sleep(3000);

        // Navigate to Eco Mart application
        driver.navigate().to("https://ecommerce-app-1-fnc3.onrender.com/");

        System.out.println("Navigated to Eco Mart Successfully");

        Thread.sleep(3000);

        // Navigate back
        driver.navigate().back();

        System.out.println("Back Navigation Successful");

        Thread.sleep(3000);

        // Navigate forward
        driver.navigate().forward();

        System.out.println("Forward Navigation Successful");

        Thread.sleep(3000);

        // Refresh current page
        driver.navigate().refresh();

        System.out.println("Page Refreshed Successfully");

        Thread.sleep(3000);

        // Print page title
        System.out.println("Page Title: " + driver.getTitle());

        // Print current URL
        System.out.println("Current URL: " + driver.getCurrentUrl());
    }
}