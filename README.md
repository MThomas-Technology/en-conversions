# EN Conversions Library

## Usage

### Adding the library to your template

To use the library, add the code from /src/index.js directly to your Engaging Networks template code header.

### Handling conversions

Once the library detects that a conversion has happened, it will dispatch several custom events:

* `synthetic-en:conversion` will be dispatched for all conversions
* `synthetic-en:conversion:{pageType}` will be dispatched for all conversions. {pageType} will be equal to the value of the `pageType` property found in the `pageJson` data.
* `synthetic-en:conversion:group:donation` will be dispatched for conversions on donation, premiumgift or ecommerce page types.
* `synthetic-en:conversion:group:submission` will be dispatched for conversions on all other page types.

To handle a conversion, you can listen for these events in your template code and handle them according to your own needs (for example, sending the conversion to an analytics service):

```js
window.addEventListener('synthetic-en:conversion', function() {
  // your code here
});
```

### Overriding default conversion detection

To prevent the library dispatching a conversion event on a specific page, add a code block with the following content to the subpage where the conversion would happen:

```html
<script>
  window.ENConversion_DontConvert = true;
</script>
```

To have the library dispatch a conversion event on a page where it normally would not, add a code block with the following content to the subpage where you would like that to happen:

```html
<script>
  window.ENConversion_Convert = true;
</script>
```

## Tests

To run the tests, first clone this repository and install the dependencies. Requires Node.js v16.18.0 or later.

```sh
git clone https://github.com/MThomas-Technology/en-conversions.git
npm install
```

Then you can run the tests with

```sh
npm run test
```