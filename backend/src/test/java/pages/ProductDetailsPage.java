package pages;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.JavascriptExecutor;
import java.time.Duration;
import java.util.List;


public class ProductDetailsPage {

    private WebDriver driver;
    private WebDriverWait wait;

    public ProductDetailsPage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(30));
    }

    // Product title
    private By productName =
            By.tagName("h1");

    // Product price
    private By productPrice =
            By.cssSelector(".price-tag");

    // Product MRP
    private By productMRP =
            By.cssSelector(".price-strike");

    // Discount badge
    private By discountBadge =
            By.cssSelector(".badge-sale");

    // Stock status
    private By stockBadge =
            By.cssSelector(".badge-success, .badge-error, .badge-warning");

    // Product image
    private By productImage =
            By.cssSelector("img[alt]");

    // Description tab
    private By descriptionTab =
            By.xpath("//button[normalize-space()='Description']");

    // Specifications tab
    private By specificationsTab =
            By.xpath("//button[normalize-space()='Specifications']");

    // Reviews tab
    private By reviewsTab =
            By.xpath("//button[normalize-space()='Reviews']");

    // Add to cart button
    private By addToCartButton =
            By.cssSelector(".btn-ghost");

    // Buy now button
    private By buyNowButton =
            By.cssSelector(".btn-primary");

    /**
     * Wait for product page to load
     */
    public void waitForPageToLoad()
            throws InterruptedException {

        wait.until(
                ExpectedConditions.visibilityOfElementLocated(productName)
        );

        ((JavascriptExecutor) driver)
                .executeScript(
                        "window.scrollTo(0,0);"
                );

        Thread.sleep(4000);

        System.out.println("Product detail page loaded.");
    }

    /**
     * Get product name
     */
    public String getProductName() {

        String name =
                driver.findElement(productName)
                        .getText()
                        .trim();

        System.out.println(
                "Product Name : " + name
        );

        return name;
    }

    /**
     * Get product price
     */
    public String getProductPrice() {

        try {

            String price =
                    driver.findElement(productPrice)
                            .getText()
                            .trim();

            System.out.println(
                    "Price : " + price
            );

            return price;

        } catch (Exception e) {

            return "";
        }
    }

    /**
     * Get product MRP
     */
    public String getProductMRP() {

        try {

            return driver.findElement(productMRP)
                    .getText()
                    .trim();

        } catch (Exception e) {

            return "";
        }
    }

    /**
     * Get discount text
     */
    public String getDiscountText() {

        try {

            return driver.findElement(discountBadge)
                    .getText()
                    .trim();

        } catch (Exception e) {

            return "";
        }
    }

    /**
     * Get stock status
     */
    public String getStockStatus() {

        try {

            return driver.findElement(stockBadge)
                    .getText()
                    .trim();

        } catch (Exception e) {

            return "";
        }
    }

    /**
     * Check product title
     */
    public boolean isProductNameVisible() {

        try {

            return driver.findElement(productName)
                    .isDisplayed();

        } catch (Exception e) {

            return false;
        }
    }

    /**
     * Check product price
     */
    public boolean isPriceVisible() {

        try {

            return driver.findElement(productPrice)
                    .isDisplayed();

        } catch (Exception e) {

            return false;
        }
    }

    /**
     * Check product image
     */
    public boolean isProductImageVisible() {

        try {

            List<WebElement> images =
                    driver.findElements(productImage);

            return !images.isEmpty();

        } catch (Exception e) {

            return false;
        }
    }

    /**
     * Check Add to Cart button
     */
    public boolean isAddToCartVisible() {

        try {

            return driver.findElement(addToCartButton)
                    .isDisplayed();

        } catch (Exception e) {

            return false;
        }
    }

    /**
     * Check Buy Now button
     */
    public boolean isBuyNowVisible() {

        try {

            return driver.findElement(buyNowButton)
                    .isDisplayed();

        } catch (Exception e) {

            return false;
        }
    }

    /**
     * Get description text
     */
    public String getDescriptionText() {

        try {

            WebElement descriptionBtn =
                    wait.until(
                            ExpectedConditions.elementToBeClickable(
                                    descriptionTab
                            )
                    );

            ((JavascriptExecutor) driver)
                    .executeScript(
                            "arguments[0].scrollIntoView({behavior:'smooth',block:'center'});",
                            descriptionBtn
                    );

            Thread.sleep(2000);

            descriptionBtn.click();

            Thread.sleep(2000);

            WebElement descriptionContent =
                    driver.findElement(
                            By.xpath(
                                    "//button[contains(text(),'Description')]/following::div[1]"
                            )
                    );

            ((JavascriptExecutor) driver)
                    .executeScript(
                            "arguments[0].scrollIntoView({behavior:'smooth',block:'center'});",
                            descriptionContent
                    );

            Thread.sleep(3000);

            return descriptionContent.getText();

        } catch (Exception e) {

            return "";
        }
    }
    /**
     * Get specification text
     */
    public String getSpecificationsText() {

        try {

            WebElement specificationBtn =
                    wait.until(
                            ExpectedConditions.elementToBeClickable(
                                    specificationsTab
                            )
                    );

            ((JavascriptExecutor) driver)
                    .executeScript(
                            "arguments[0].scrollIntoView({behavior:'smooth',block:'center'});",
                            specificationBtn
                    );

            Thread.sleep(2000);

            specificationBtn.click();

            Thread.sleep(3000);

            WebElement specificationContent =
                    driver.findElement(
                            By.xpath(
                                    "//button[contains(text(),'Specifications')]/following::div[1]"
                            )
                    );

            ((JavascriptExecutor) driver)
                    .executeScript(
                            "arguments[0].scrollIntoView({behavior:'smooth',block:'center'});",
                            specificationContent
                    );

            Thread.sleep(3000);

            return specificationContent.getText();

        } catch (Exception e) {

            return "";
        }
    }
    /**
     * Get Reviews text
     */
    public String getReviewsText() {

        try {

            WebElement reviewBtn =
                    wait.until(
                            ExpectedConditions.elementToBeClickable(
                                    reviewsTab
                            )
                    );

            ((JavascriptExecutor) driver)
                    .executeScript(
                            "arguments[0].scrollIntoView({behavior:'smooth',block:'center'});",
                            reviewBtn
                    );

            Thread.sleep(2000);

            reviewBtn.click();

            Thread.sleep(3000);

            WebElement reviewContent =
                    driver.findElement(
                            By.xpath(
                                    "//button[contains(text(),'Reviews')]/following::div[1]"
                            )
                    );

            ((JavascriptExecutor) driver)
                    .executeScript(
                            "arguments[0].scrollIntoView({behavior:'smooth',block:'center'});",
                            reviewContent
                    );

            Thread.sleep(3000);

            return reviewContent.getText();

        } catch (Exception e) {

            return "";
        }
    }


    /**
     * Verify detail page URL
     */
    public boolean isOnProductDetailPage() {

        return driver.getCurrentUrl()
                .contains("/product/");
    }

    /**
     * Current page URL
     */
    public String getCurrentUrl() {

        return driver.getCurrentUrl();
    }

    /**
     * Navigate back to listing page
     */
    public void goBackToListing()
            throws InterruptedException {

        driver.navigate().back();

        Thread.sleep(4000);

        System.out.println(
                "Returned to product listing page."
        );
    }


}
