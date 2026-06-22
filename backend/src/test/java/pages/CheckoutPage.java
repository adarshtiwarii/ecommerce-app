package pages;

import org.openqa.selenium.By;
import org.openqa.selenium.ElementClickInterceptedException;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.Keys;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;
import utils.CommonUtils;

import java.time.Duration;
import java.util.List;
import java.util.Locale;

/**
 * Page Object Model for checkout initiation and checkout form validation.
 */
public class CheckoutPage {

    private final WebDriver driver;
    private final WebDriverWait wait;
    private final CommonUtils commonUtils;

    private final By checkoutButton = By.xpath("//button[normalize-space()='Checkout' or contains(normalize-space(),'Proceed to Checkout')]");
    private final By removeButtons = By.xpath("//article[contains(@class,'card')]//button[contains(normalize-space(),'Remove')]");
    private final By emptyCartMessage = By.xpath("//*[contains(normalize-space(),'cart is empty') or normalize-space()='Your cart is empty']");
    private final By cartItemCards = By.cssSelector("article.card");
    private final By orderSummaryTitle = By.xpath("//*[normalize-space()='Order Summary']");
    private final By fullNameField = By.xpath("//input[@placeholder='Rahul Sharma']");
    private final By phoneField = By.xpath("//input[@placeholder='10-digit mobile']");
    private final By pincodeField = By.xpath("//input[@placeholder='400001']");
    private final By cityField = By.xpath("//input[@placeholder='Mumbai']");
    private final By stateDropdown = By.xpath("//select[.//option[contains(normalize-space(),'Select state')]]");
    private final By addressField = By.xpath("//textarea[contains(@placeholder,'Flat no')]");
    private final By useLocationButton = By.xpath("//button[contains(normalize-space(),'Use Location') or contains(normalize-space(),'Detected') or contains(normalize-space(),'Detecting')]");
    private final By locationMessage = By.xpath("//*[contains(normalize-space(),'Permission denied') or contains(normalize-space(),'Location not supported') or contains(normalize-space(),'Detecting') or contains(normalize-space(),'Detected:')]");
    private final By deliverHereButton = By.xpath("//button[contains(normalize-space(),'Deliver Here')]");
    private final By razorpayOption = By.xpath("//label[.//p[normalize-space()='Razorpay']]");
    private final By codOption = By.xpath("//label[.//p[normalize-space()='Cash on Delivery']]");
    private final By paymentSectionTitle = By.xpath("//*[normalize-space()='Payment Method']");
    private final By placeCodOrderButton = By.xpath("//button[contains(normalize-space(),'Place COD Order')]");
    private final By paySecurelyButton = By.xpath("//button[contains(normalize-space(),'Pay Securely')]");

    public CheckoutPage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(30));
        this.commonUtils = new CommonUtils(driver);
    }

    public void openCartPage() {
        driver.get(getApplicationBaseUrl() + "/cart");
        waitForCartPageReady();
        System.out.println("Cart page opened for checkout validation.");
    }

    public void clearCartIfNotEmpty() {
        openCartPage();

        int safetyCounter = 0;
        while (!driver.findElements(removeButtons).isEmpty() && safetyCounter < 10) {
            List<WebElement> buttons = driver.findElements(removeButtons);
            WebElement removeButton = buttons.get(0);
            commonUtils.scrollToElement(removeButton);
            wait.until(ExpectedConditions.elementToBeClickable(removeButton)).click();
            wait.until(driver -> driver.findElements(removeButtons).size() < buttons.size()
                    || driver.findElements(emptyCartMessage).stream().anyMatch(WebElement::isDisplayed));
            safetyCounter++;
        }

        System.out.println("Cart cleanup completed before checkout test.");
    }

    public void initiateCheckoutFromCart() {
        openCartPage();
        WebElement button = wait.until(ExpectedConditions.elementToBeClickable(checkoutButton));
        commonUtils.scrollToElement(button);
        button.click();
        wait.until(ExpectedConditions.urlContains("/checkout"));
        wait.until(ExpectedConditions.visibilityOfElementLocated(orderSummaryTitle));
        System.out.println("Checkout initiated from cart.");
    }

    public boolean isUserStillOnCartPage() {
        return driver.getCurrentUrl().contains("/cart");
    }

    public boolean isEmptyCartMessageDisplayed() {
        try {
            return commonUtils.waitForVisible(emptyCartMessage).isDisplayed();
        } catch (TimeoutException exception) {
            return false;
        }
    }

    public boolean isCheckoutButtonUnavailable() {
        return driver.findElements(checkoutButton).isEmpty();
    }

    public boolean isCheckoutPageDisplayed() {
        return driver.getCurrentUrl().contains("/checkout")
                && isOrderSummaryVisible();
    }

    public boolean isOrderSummaryVisible() {
        try {
            return commonUtils.waitForVisible(orderSummaryTitle).isDisplayed();
        } catch (TimeoutException exception) {
            return false;
        }
    }

    public boolean isCheckoutItemDisplayed(String productName) {
        return getOrderSummaryText().toLowerCase(Locale.ROOT)
                .contains(productName.toLowerCase(Locale.ROOT));
    }

    public int getCheckoutItemQuantity(String productName) {
        WebElement item = findOrderSummaryItem(productName);
        String text = item.getText();
        String quantityText = text.replaceAll("(?s).*Qty\\s*(\\d+).*", "$1");

        if (quantityText.equals(text)) {
            return 0;
        }

        return Integer.parseInt(quantityText);
    }

    public int getDisplayedCheckoutItemCount() {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(orderSummaryTitle))
                .findElement(By.xpath("./following-sibling::span"))
                .getText()
                .replaceAll("[^0-9]", "")
                .isEmpty()
                ? 0
                : Integer.parseInt(wait.until(ExpectedConditions.visibilityOfElementLocated(orderSummaryTitle))
                .findElement(By.xpath("./following-sibling::span"))
                .getText()
                .replaceAll("[^0-9]", ""));
    }

    public void clearAddressForm() {
        clearField(fullNameField);
        clearField(phoneField);
        clearField(pincodeField);
        clearField(cityField);
        clearField(addressField);
        new Select(commonUtils.waitForVisible(stateDropdown)).selectByValue("");
        System.out.println("Checkout address form cleared.");
    }

    public void fillValidIndiaAddress() {
        fillAddress(
                "Rahul Sharma",
                "9876543210",
                "400001",
                "Mumbai",
                "Maharashtra",
                "Flat 21, Test Street, Fort"
        );
    }

    public void fillAddressWithSpecialCharacterName() {
        fillAddress(
                "Anne-Marie D'Souza",
                "9876543210",
                "400001",
                "Mumbai",
                "Maharashtra",
                "Flat 21, Test Street, Fort"
        );
    }

    public void fillAddress(String name, String phone, String pincode, String city, String state, String address) {
        typeTextWithScroll(fullNameField, name);
        typeTextWithScroll(phoneField, phone);
        typeTextWithScroll(pincodeField, pincode);
        typeTextWithScroll(cityField, city);
        WebElement stateElement = commonUtils.waitForVisible(stateDropdown);
        scrollBelowStickyHeader(stateElement);
        Select stateSelect = new Select(stateElement);
        if (state == null || state.isBlank()) {
            stateSelect.selectByValue("");
        } else {
            stateSelect.selectByVisibleText(state);
        }
        typeTextWithScroll(addressField, address);
        System.out.println("Checkout address form filled.");
    }

    public void fillCustomerNameAndPhone(String name, String phone) {
        typeTextWithScroll(fullNameField, name);
        typeTextWithScroll(phoneField, phone);
        System.out.println("Customer name and phone filled.");
    }

    public boolean isDeliverHereDisabled() {
        return !commonUtils.waitForVisible(deliverHereButton).isEnabled();
    }

    public boolean isDeliverHereEnabled() {
        return commonUtils.waitForVisible(deliverHereButton).isEnabled();
    }

    public void continueToPayment() {
        WebElement button = wait.until(ExpectedConditions.elementToBeClickable(deliverHereButton));
        scrollBelowStickyHeader(button);
        safeClick(button);
        wait.until(ExpectedConditions.visibilityOfElementLocated(paymentSectionTitle));
        wait.until(ExpectedConditions.or(
                ExpectedConditions.visibilityOfElementLocated(razorpayOption),
                ExpectedConditions.visibilityOfElementLocated(codOption)
        ));
        System.out.println("Checkout moved to payment step.");
    }

    public void selectCashOnDelivery() {
        WebElement paymentTitle = commonUtils.waitForVisible(paymentSectionTitle);
        scrollBelowStickyHeader(paymentTitle);
        waitUntilNotCoveredBySearchBox(paymentTitle);

        WebElement option = wait.until(ExpectedConditions.visibilityOfElementLocated(codOption));
        scrollBelowStickyHeader(option);
        waitUntilNotCoveredBySearchBox(option);
        safeClick(option);
        wait.until(ExpectedConditions.visibilityOfElementLocated(placeCodOrderButton));
        System.out.println("Cash on Delivery selected.");
    }

    public void selectRazorpay() {
        WebElement option = commonUtils.waitForVisible(razorpayOption);
        scrollBelowStickyHeader(option);
        safeClick(option);
        wait.until(ExpectedConditions.visibilityOfElementLocated(paySecurelyButton));
        System.out.println("Razorpay selected.");
    }

    public boolean isCodPaymentButtonVisible() {
        try {
            return commonUtils.waitForVisible(placeCodOrderButton).isDisplayed();
        } catch (TimeoutException exception) {
            return false;
        }
    }

    public boolean isRazorpayPaymentButtonVisible() {
        try {
            return commonUtils.waitForVisible(paySecurelyButton).isDisplayed();
        } catch (TimeoutException exception) {
            return false;
        }
    }

    public boolean isPhoneTrimmedToTenDigits() {
        return commonUtils.waitForVisible(phoneField).getAttribute("value").length() == 10;
    }

    public boolean isPincodeTrimmedToSixDigits() {
        return commonUtils.waitForVisible(pincodeField).getAttribute("value").length() == 6;
    }

    public String getPhoneNumberValue() {
        return getFieldValue(phoneField);
    }

    public String getPincodeValue() {
        return getFieldValue(pincodeField);
    }

    public String getFullNameValue() {
        return getFieldValue(fullNameField);
    }

    public String getCityValue() {
        return getFieldValue(cityField);
    }

    public String getStateValue() {
        return commonUtils.waitForVisible(stateDropdown).getAttribute("value").trim();
    }

    public String getAddressValue() {
        return getFieldValue(addressField);
    }

    public void mockSuccessfulLocationAutofill() {
        ((JavascriptExecutor) driver).executeScript(
                "Object.defineProperty(navigator, 'geolocation', {" +
                        "value: {" +
                        "getCurrentPosition: function(success) {" +
                        "success({coords: {latitude: 19.076, longitude: 72.8777}});" +
                        "}" +
                        "}, configurable: true" +
                        "});" +
                        "window.__originalFetch = window.fetch;" +
                        "window.fetch = function(url, options) {" +
                        "if (String(url).includes('nominatim.openstreetmap.org')) {" +
                        "return Promise.resolve({" +
                        "json: function() { return Promise.resolve({" +
                        "display_name: 'Flat 21, Test Street, Mumbai, Maharashtra 400001'," +
                        "address: {" +
                        "house_number: '21'," +
                        "road: 'Test Street'," +
                        "suburb: 'Fort'," +
                        "city: 'Mumbai'," +
                        "state: 'Maharashtra'," +
                        "postcode: '400001'" +
                        "}" +
                        "}); }" +
                        "});" +
                        "}" +
                        "return window.__originalFetch(url, options);" +
                        "};"
        );
        System.out.println("Mock geolocation and reverse geocode response configured.");
    }

    public void clickUseLocationAutofill() {
        WebElement button = wait.until(ExpectedConditions.elementToBeClickable(useLocationButton));
        scrollBelowStickyHeader(button);
        safeClick(button);
        wait.until(driver -> !getFieldValue(pincodeField).isEmpty()
                && !getFieldValue(cityField).isEmpty()
                && !getFieldValue(addressField).isEmpty());
        System.out.println("Location autofill button clicked and address fields populated.");
    }

    public boolean isAutofilledAddressValid() {
        return getFieldValue(pincodeField).equals("400001")
                && getFieldValue(cityField).equalsIgnoreCase("Mumbai")
                && getFieldValue(addressField).toLowerCase(Locale.ROOT).contains("test street");
    }

    public boolean isLocationErrorMessageDisplayed() {
        try {
            return commonUtils.waitForVisible(locationMessage).isDisplayed();
        } catch (TimeoutException exception) {
            return false;
        }
    }

    public boolean isStillOnDeliveryStep() {
        return commonUtils.waitForVisible(deliverHereButton).isDisplayed()
                && driver.findElements(placeCodOrderButton).isEmpty()
                && driver.findElements(paySecurelyButton).isEmpty();
    }

    public void showValidationPopup(String message) {
        ((JavascriptExecutor) driver).executeScript(
                "const oldPopup = document.getElementById('selenium-validation-popup');" +
                        "if (oldPopup) oldPopup.remove();" +
                        "const popup = document.createElement('div');" +
                        "popup.id = 'selenium-validation-popup';" +
                        "popup.textContent = arguments[0];" +
                        "popup.style.position = 'fixed';" +
                        "popup.style.top = '90px';" +
                        "popup.style.left = '50%';" +
                        "popup.style.transform = 'translateX(-50%)';" +
                        "popup.style.zIndex = '99999';" +
                        "popup.style.background = '#7f1d1d';" +
                        "popup.style.color = '#fff';" +
                        "popup.style.padding = '12px 20px';" +
                        "popup.style.borderRadius = '8px';" +
                        "popup.style.boxShadow = '0 12px 30px rgba(0,0,0,0.35)';" +
                        "popup.style.font = '600 14px Arial, sans-serif';" +
                        "document.body.appendChild(popup);",
                message
        );
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("selenium-validation-popup")));
        System.out.println("Validation popup shown: " + message);
    }

    public boolean isPaymentCardFieldAbsent() {
        return driver.findElements(By.xpath(
                "//input[contains(translate(@placeholder,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'card')" +
                        " or contains(translate(@placeholder,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'cvv')" +
                        " or contains(translate(@placeholder,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'expiry')]"
        )).isEmpty();
    }

    public boolean isSessionHandledAfterTimeoutSimulation() {
        ((JavascriptExecutor) driver).executeScript(
                "localStorage.clear(); sessionStorage.clear(); window.dispatchEvent(new Event('app-logout'));"
        );
        driver.navigate().refresh();

        try {
            wait.until(ExpectedConditions.or(
                    ExpectedConditions.urlContains("/login"),
                    ExpectedConditions.visibilityOfElementLocated(By.xpath("//*[contains(normalize-space(),'Welcome Back') or contains(normalize-space(),'Login')]"))
            ));
            return true;
        } catch (TimeoutException exception) {
            return false;
        }
    }

    private void waitForCartPageReady() {
        wait.until(ExpectedConditions.urlContains("/cart"));
        wait.until(ExpectedConditions.or(
                ExpectedConditions.presenceOfElementLocated(cartItemCards),
                ExpectedConditions.presenceOfElementLocated(emptyCartMessage)
        ));
    }

    private void scrollBelowStickyHeader(WebElement element) {
        ((JavascriptExecutor) driver).executeScript(
                "const element = arguments[0];" +
                        "const rect = element.getBoundingClientRect();" +
                        "const target = rect.top + window.pageYOffset - 180;" +
                        "window.scrollTo({top: Math.max(target, 0), behavior: 'smooth'});",
                element
        );

        wait.until(driver -> (Boolean) ((JavascriptExecutor) driver).executeScript(
                "const rect = arguments[0].getBoundingClientRect();" +
                        "return rect.top > 120 && rect.bottom < (window.innerHeight || document.documentElement.clientHeight);",
                element
        ));
    }

    private void waitUntilNotCoveredBySearchBox(WebElement element) {
        wait.until(driver -> (Boolean) ((JavascriptExecutor) driver).executeScript(
                "const element = arguments[0];" +
                        "const rect = element.getBoundingClientRect();" +
                        "const x = rect.left + Math.min(rect.width / 2, 24);" +
                        "const y = rect.top + Math.min(rect.height / 2, 24);" +
                        "const topElement = document.elementFromPoint(x, y);" +
                        "return topElement === element || element.contains(topElement);",
                element
        ));
    }

    private void safeClick(WebElement element) {
        try {
            wait.until(ExpectedConditions.elementToBeClickable(element)).click();
        } catch (ElementClickInterceptedException exception) {
            System.out.println("Normal click was intercepted. Retrying with JavaScript click after scroll.");
            scrollBelowStickyHeader(element);
            ((JavascriptExecutor) driver).executeScript("arguments[0].click();", element);
        }
    }

    private void typeTextWithScroll(By locator, String text) {
        WebElement element = commonUtils.waitForVisible(locator);
        scrollBelowStickyHeader(element);
        element.clear();
        element.sendKeys(text);
        System.out.println("Entered value in field: " + locator);
    }

    private WebElement findOrderSummaryItem(String productName) {
        return wait.until(driver -> {
            List<WebElement> items = driver.findElements(By.xpath(
                    "//*[normalize-space()='Order Summary']/ancestor::aside//p[contains(normalize-space(),\"" +
                            escapeForXpath(productName) +
                            "\")]/ancestor::div[contains(.,'Qty')][1]"
            ));
            String expected = productName.toLowerCase(Locale.ROOT);

            for (WebElement item : items) {
                if (item.getText().toLowerCase(Locale.ROOT).contains(expected)) {
                    return item;
                }
            }

            return null;
        });
    }

    private String getOrderSummaryText() {
        return commonUtils.waitForVisible(By.xpath("//*[normalize-space()='Order Summary']/ancestor::aside")).getText();
    }

    private void clearField(By locator) {
        WebElement field = commonUtils.waitForVisible(locator);
        field.sendKeys(Keys.CONTROL, "a");
        field.sendKeys(Keys.DELETE);
    }

    private String getFieldValue(By locator) {
        return commonUtils.waitForVisible(locator).getAttribute("value").trim();
    }

    private String getApplicationBaseUrl() {
        String currentUrl = driver.getCurrentUrl();
        return currentUrl
                .replaceAll("(/login|/search.*|/product/.*|/cart|/checkout|/orders).*$", "")
                .replaceAll("/+$", "");
    }

    private String escapeForXpath(String value) {
        return value.replace("\"", "\\\"");
    }
}
