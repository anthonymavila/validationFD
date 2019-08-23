# validationFD

Simple form validation in javascript. Currently only testing this.

## Installation

Just include the .css and .js files.

## Usage

```javascript
  var validation = [  
    ["string_test", "string|require|max:2"],
    ["numeric_test", "numeric|require|in:30,15,5|integer"],
    ["phone_test", "phone|require"],
    ["email_test", "email|require"],
    ["date_test", "date|nullable"],
  ];

  var messages = [
  	["string_test|max", "this is a custom error message for string_test when it fails max. max of 2."],
  ];


  frm_validator = new ValidationFD({
  	form: "frm_validator",
  	rules: validation,
  	messages: messages
  });
```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.


## License
[MIT]