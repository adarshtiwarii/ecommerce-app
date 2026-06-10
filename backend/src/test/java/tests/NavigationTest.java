package tests;

import base.BaseTest;
import org.testng.annotations.Test;

public class NavigationTest extends BaseTest {

    @Test
    public void verifyNavigation() throws InterruptedException {

        // Application opened
        System.out.println("Application Opened Successfully");

        Thread.sleep(3000);

        // Navigate to application
        driver.navigate().to("https://ecommerce-app-1-fnc3.onrender.com/");

        System.out.println("Navigation Successful");

        Thread.sleep(3000);

        // Navigate back
        driver.navigate().back();

        System.out.println("Back Navigation Successful");

        Thread.sleep(3000);

        // Navigate forward
        driver.navigate().forward();

        System.out.println("Forward Navigation Successful");

        Thread.sleep(3000);

        // Refresh page
        driver.navigate().refresh();

        System.out.println("Page Refreshed Successfully");

        Thread.sleep(3000);

        // Print title
        System.out.println("Page Title: " + driver.getTitle());

        // Print URL
        System.out.println("Current URL: " + driver.getCurrentUrl());
    }
}