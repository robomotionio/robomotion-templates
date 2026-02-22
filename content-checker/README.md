# Content Checker

Monitors a webpage element for changes — useful for tracking price drops, stock availability, or any text content on a page.

## How It Works

The flow opens a browser, navigates to your target URL, and reads the text of a specific element using its XPath selector. It compares that value against the `initialValue` you provided and shows a dialog telling you whether the content changed or not.

To find the right XPath for an element, right-click it in your browser, select **Inspect**, then right-click the highlighted HTML and choose **Copy > Copy XPath**. See this [XPath cheatsheet](https://devhints.io/xpath) for more selector patterns.

## Configuration

Open the **Config** node and set:

| Variable | Description | Example |
|---|---|---|
| `msg.url` | Page URL to monitor | `"https://example.com/product"` |
| `msg.selector` | XPath of the element to watch | `'//*[@id="price"]/span'` |
| `msg.initialValue` | Expected value to compare against | `"$11.75"` |
