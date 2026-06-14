package pages;

import org.openqa.selenium.*;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import utils.CommonUtils;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public class ProductListingPage {

    private WebDriver driver;
    private WebDriverWait wait;
    private CommonUtils commonUtils;

    public ProductListingPage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(30));
        this.commonUtils = new CommonUtils(driver);
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

    // Desktop search input in the top navigation bar
    private By searchInput =
            By.xpath("//input[contains(@placeholder,'Search products')]");

    // Product result heading on search page
    private By searchHeading =
            By.xpath("//h1[contains(normalize-space(),'Results for') or normalize-space()='All Products']");

    // Sort dropdown on search page
    private By sortDropdown =
            By.cssSelector("main select");

    /**
     * Wait until products are loaded.
     */
    public void waitForProductsToLoad() {
        try {
            commonUtils.waitUntil(driver ->
                    driver.findElements(productCards).size() > 0
            );
        } catch (TimeoutException e) {
            System.out.println("No products found after filter — may be expected.");
        }
        System.out.println("Products Loaded: " + driver.findElements(productCards).size());
    }

    /**
     * Returns total number of products.
     */
    public int getProductCount() {

        return commonUtils.retryOnStaleElement(() ->
                driver.findElements(productCards).size()
        );
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

        return commonUtils.retryOnStaleElement(() -> {
            List<WebElement> products =
                    driver.findElements(productCards);

            return products.get(index)
                    .findElement(productName)
                    .getText()
                    .trim();
        });
    }

    /**
     * Returns product price by index.
     */
    public String getProductPrice(int index) {

        return commonUtils.retryOnStaleElement(() -> {
            List<WebElement> products =
                    driver.findElements(productCards);

            return products.get(index)
                    .findElement(productPrice)
                    .getText()
                    .trim();
        });
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

        commonUtils.retryOnStaleElement(() -> {
            List<WebElement> products =
                    driver.findElements(
                            By.cssSelector("article.card h3")
                    );

            for (WebElement product : products) {

                String name =
                        product.getText().trim();

                if (name.contains(productName)) {

                    commonUtils.scrollToElement(product);

                    wait.until(
                            ExpectedConditions.elementToBeClickable(product)
                    );

                    product.click();

                    commonUtils.waitForUrlContains("/product/");

                    break;
                }
            }

            return true;
        });
    }

    /**
     * Searches products from the navigation search bar.
     */
    public void searchByProductName(String productName) {

        WebElement searchBox =
                commonUtils.waitForVisible(searchInput);

        searchBox.clear();
        searchBox.sendKeys(productName);

        commonUtils.submitParentForm(searchBox);
        commonUtils.waitForUrlContains("/search");
        commonUtils.waitForVisible(searchHeading);
        waitForProductsToLoad();

        System.out.println(
                "Search executed for product: "
                        + productName
        );
    }

    /**
     * Returns all product names from the current listing.
     */
    public List<String> getAllProductNames() {

        return commonUtils.retryOnStaleElement(() -> {
            List<String> names =
                    new ArrayList<>();

            List<WebElement> products =
                    driver.findElements(productCards);

            for (WebElement product : products) {
                String name =
                        product.findElement(productName)
                                .getText()
                                .trim();

                if (!name.isEmpty()) {
                    names.add(name);
                }
            }

            return names;
        });
    }

    /**
     * Verifies that every displayed product name contains the search text.
     */
    public boolean areAllProductsMatchingSearch(String searchText) {

        String expected =
                searchText.toLowerCase(Locale.ROOT);

        List<String> names =
                getAllProductNames();

        for (String name : names) {
            if (!name.toLowerCase(Locale.ROOT).contains(expected)) {
                System.out.println(
                        "Search mismatch found: "
                                + name
                );
                return false;
            }
        }

        return !names.isEmpty();
    }

    /**
     * Verifies that a specific product is visible in the current listing.
     */
    public boolean isProductDisplayed(String expectedProductName) {

        String expected =
                expectedProductName.toLowerCase(Locale.ROOT);

        List<String> names =
                getAllProductNames();

        for (String name : names) {
            if (name.toLowerCase(Locale.ROOT).contains(expected)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Selects a price filter by its visible label.
     */
    public void selectPriceFilter(String visibleLabel) {

        By priceFilter =
                By.xpath("//label[contains(normalize-space(),'" + visibleLabel + "')]/input[@name='price']");

        commonUtils.clickWhenReady(priceFilter);
        waitForSearchPageToSettle();

        System.out.println(
                "Price filter selected: "
                        + visibleLabel
        );
    }

    /**
     * Selects a rating filter by star value.
     */
    public void selectRatingFilter(int rating) {

        String label =
                rating == 0
                        ? "All ratings"
                        : rating + " star";

        By ratingFilter =
                By.xpath("//label[contains(normalize-space(),'" + label + "')]/input[@name='rating']");

        commonUtils.clickWhenReady(ratingFilter);
        waitForSearchPageToSettle();

        System.out.println(
                "Rating filter selected: "
                        + label
        );
    }

    /**
     * Returns true when the requested rating filter is selected.
     */
    public boolean isRatingFilterSelected(int rating) {

        String label =
                rating == 0
                        ? "All ratings"
                        : rating + " star";

        By ratingFilter =
                By.xpath("//label[contains(normalize-space(),'" + label + "')]/input[@name='rating']");

        return commonUtils.waitForVisible(ratingFilter)
                .isSelected();
    }

    /**
     * Resets price filter to All prices when the option is available.
     */
    public void resetPriceFilterIfAvailable() {

        By allPrices =
                By.xpath("//label[contains(normalize-space(),'All prices')]/input[@name='price']");

        if (commonUtils.isElementPresent(allPrices)) {
            commonUtils.clickWhenReady(allPrices);
            waitForSearchPageToSettle();
        }
    }

    /**
     * Returns true when All prices filter is selected.
     */
    public boolean isAllPricesFilterSelected() {

        By allPrices =
                By.xpath("//label[contains(normalize-space(),'All prices')]/input[@name='price']");

        return commonUtils.waitForVisible(allPrices)
                .isSelected();
    }

    /**
     * Verifies all visible products are inside the expected price range.
     */
    public boolean areAllProductPricesWithinRange(double minimumPrice, double maximumPrice) {

        List<Double> prices =
                getAllProductPrices();

        for (Double price : prices) {
            if (price < minimumPrice || price > maximumPrice) {
                System.out.println(
                        "Price outside selected filter range: "
                                + price
                );
                return false;
            }
        }

        return !prices.isEmpty();
    }

    /**
     * Returns all product prices as numeric values.
     */
    public List<Double> getAllProductPrices() {

        return commonUtils.retryOnStaleElement(() -> {
            List<Double> prices =
                    new ArrayList<>();

            List<WebElement> products =
                    driver.findElements(productCards);

            for (WebElement product : products) {
                String priceText =
                        product.findElement(productPrice)
                                .getText();

                prices.add(
                        extractPrice(priceText)
                );
            }

            return prices;
        });
    }

    /**
     * Waits for dynamic search/filter content to finish rendering.
     * First waits for page load strategy to complete via pageLoadTimeout,
     * then checks DOM readyState, then waits for heading and sort dropdown
     * to confirm React has finished rendering the search results.
     */
    public void waitForSearchPageToSettle() {

        // Wait for browser page load to finish before DOM check
        driver.manage().timeouts().pageLoadTimeout(Duration.ofSeconds(30));

        // Wait for DOM readyState = complete
        commonUtils.waitForDomReady();

        // Wait for React to render the search heading
        commonUtils.waitForVisible(searchHeading);

        // Wait for sort dropdown to confirm full page render
        wait.until(
                ExpectedConditions.visibilityOfElementLocated(sortDropdown)
        );
    }

    /**
     * Converts displayed price text into a numeric value.
     */
    private double extractPrice(String priceText) {

        String normalizedPrice =
                priceText.replaceAll("[^0-9.]", "");

        if (normalizedPrice.isEmpty()) {
            return 0;
        }

        return Double.parseDouble(normalizedPrice);
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