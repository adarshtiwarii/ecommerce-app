package utils;

import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.StaleElementReferenceException;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedCondition;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;
import java.util.List;
import java.util.function.Supplier;

public class CommonUtils {

    private final WebDriver driver;
    private final WebDriverWait wait;

    public CommonUtils(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(30));
    }

    /**
     * Waits until an element is visible on the page.
     */
    public WebElement waitForVisible(org.openqa.selenium.By locator) {

        return wait.until(
                ExpectedConditions.visibilityOfElementLocated(locator)
        );
    }

    /**
     * Waits until an element becomes clickable.
     */
    public WebElement waitForClickable(org.openqa.selenium.By locator) {

        return wait.until(
                ExpectedConditions.elementToBeClickable(locator)
        );
    }

    /**
     * Clicks an element after scrolling it into view.
     */
    public void clickWhenReady(org.openqa.selenium.By locator) {

        WebElement element =
                waitForClickable(locator);

        scrollToElement(element);

        element.click();
    }

    /**
     * Clears a text field and enters new text.
     */
    public void typeText(org.openqa.selenium.By locator,
                         String text) {

        WebElement element =
                waitForVisible(locator);

        element.clear();

        element.sendKeys(text);
    }

    /**
     * Submits the nearest parent form using JavaScript.
     */
    public void submitParentForm(WebElement element) {

        ((JavascriptExecutor) driver)
                .executeScript(
                        "arguments[0].closest('form').requestSubmit();",
                        element
                );
    }

    /**
     * Scrolls an element into the center of the viewport.
     */
    public void scrollToElement(WebElement element) {

        ((JavascriptExecutor) driver)
                .executeScript(
                        "arguments[0].scrollIntoView({block:'center', behavior:'smooth'});",
                        element
                );
    }

    /**
     * Waits until all matching elements are available.
     */
    public List<WebElement> waitForElements(org.openqa.selenium.By locator) {

        return wait.until(
                ExpectedConditions.presenceOfAllElementsLocatedBy(locator)
        );
    }

    /**
     * Waits until the current URL contains the expected value.
     */
    public void waitForUrlContains(String expectedText) {

        wait.until(
                ExpectedConditions.urlContains(expectedText)
        );
    }

    /**
     * Waits for a custom expected condition.
     */
    public void waitUntil(ExpectedCondition<Boolean> condition) {

        wait.until(condition);
    }

    /**
     * Retries an action when the page is re-rendered by React.
     */
    public <T> T retryOnStaleElement(Supplier<T> action) {

        for (int attempt = 1; attempt <= 3; attempt++) {

            try {

                return action.get();

            } catch (StaleElementReferenceException exception) {

                System.out.println(
                        "DOM refreshed. Retrying... Attempt "
                                + attempt
                );

                waitForDomReady();
            }
        }

        throw new StaleElementReferenceException(
                "Element remained stale after multiple retries."
        );
    }

    /**
     * Waits until the page DOM is completely loaded.
     * Increased sleep to 1500ms so React SPA navigation
     * finishes before readyState is checked.
     * WebDriverException is caught to handle mid-navigation
     * script execution failures gracefully.
     */
    public void waitForDomReady() {

        try {

            // Wait longer so browser finishes navigation before DOM check
            Thread.sleep(1500);

            wait.until(driver -> {

                try {

                    return "complete".equals(

                            ((JavascriptExecutor) driver)
                                    .executeScript(
                                            "return document.readyState"
                                    )
                    );

                } catch (WebDriverException exception) {

                    // Navigation still in-flight, retry silently
                    return false;

                } catch (Exception exception) {

                    return false;
                }
            });

        } catch (InterruptedException exception) {

            Thread.currentThread().interrupt();

        } catch (TimeoutException exception) {

            System.out.println(
                    "DOM changed while loading. Continuing execution."
            );
        }
    }

    /**
     * Checks whether an optional element exists.
     */
    public boolean isElementPresent(org.openqa.selenium.By locator) {

        try {

            wait.until(
                    ExpectedConditions.presenceOfElementLocated(locator)
            );

            return true;

        } catch (TimeoutException exception) {

            return false;
        }
    }
}