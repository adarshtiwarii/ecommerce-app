package pages;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;
import java.util.List;

public class ProductListingPage {

    private WebDriver driver;
    private WebDriverWait wait;

    public ProductListingPage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(30));
    }

    // Product Card
    private By productCards =
            By.cssSelector("article.card");

    // Product Image
    private By productImage =
            By.tagName("img");

    // Product Name
    private By productName =
            By.tagName("h3");

    // Product Price
    private By productPrice =
            By.cssSelector(".price-tag");

    /**
     * Wait until products are loaded.
     */
    public void waitForProductsToLoad() {

        wait.until(driver ->
                driver.findElements(productCards).size() > 0
        );

        System.out.println(
                "Products Loaded: "
                        + driver.findElements(productCards).size()
        );
    }

    /**
     * Returns total number of products.
     */
    public int getProductCount() {

        return driver.findElements(productCards).size();
    }

    /**
     * Verify product images are visible.
     */
    public boolean isProductImageVisible() {

        List<WebElement> products =
                driver.findElements(productCards);

        int count = 1;

        for (WebElement product : products) {

            List<WebElement> images =
                    product.findElements(productImage);

            System.out.println(
                    "Product " + count +
                            " Image Count = " +
                            images.size()
            );

            if (images.isEmpty()) {
                return false;
            }

            count++;
        }

        return true;
    }

    /**
     * Verify product names are visible.
     */
    public boolean isProductNameVisible() {

        List<WebElement> names =
                driver.findElements(productName);

        System.out.println(
                "Total Product Names Found : "
                        + names.size()
        );

        return !names.isEmpty();
    }

    /**
     * Verify product prices are visible.
     */
    public boolean isProductPriceVisible() {

        List<WebElement> prices =
                driver.findElements(productPrice);

        System.out.println(
                "Total Product Prices Found : "
                        + prices.size()
        );

        return !prices.isEmpty();
    }

    /**
     * Returns product name by index.
     */
    public String getProductName(int index) {

        List<WebElement> products =
                driver.findElements(productCards);

        return products.get(index)
                .findElement(productName)
                .getText()
                .trim();
    }

    /**
     * Returns product price by index.
     */
    public String getProductPrice(int index) {

        List<WebElement> products =
                driver.findElements(productCards);

        return products.get(index)
                .findElement(productPrice)
                .getText()
                .trim();
    }

    /**
     * Prints all product names.
     */
    public void printAllProductNames() {

        List<WebElement> products =
                driver.findElements(productCards);

        System.out.println("\nAvailable Products:");

        for (WebElement product : products) {

            String name =
                    product.findElement(productName)
                            .getText()
                            .trim();

            if (!name.isEmpty()) {

                System.out.println(name);
            }
        }
    }
    public void clickProductByName(String productName)
            throws InterruptedException {

        List<WebElement> products =
                driver.findElements(
                        By.cssSelector("article.card h3")
                );

        for (WebElement product : products) {

            String name =
                    product.getText().trim();

            if (name.contains(productName)) {

                ((JavascriptExecutor) driver)
                        .executeScript(
                                "arguments[0].scrollIntoView({behavior:'smooth',block:'center'});",
                                product
                        );

                Thread.sleep(2000);

                product.click();

                Thread.sleep(3000);

                break;
            }
        }
    }
    /**
     * Scrolls to last product card.
     */
    public void scrollToLastProduct()
            throws InterruptedException {

        JavascriptExecutor js =
                (JavascriptExecutor) driver;

        long pageHeight =
                (Long) js.executeScript(
                        "return document.body.scrollHeight");

        for (int i = 0; i < pageHeight; i += 300) {

            js.executeScript(
                    "window.scrollTo(0, arguments[0]);",
                    i
            );

            Thread.sleep(800);
        }

        System.out.println(
                "Scrolled slowly till last product."
        );


    }
}