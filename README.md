# Fluenium 
<img src="https://image.flaticon.com/icons/svg/1017/1017466.svg" width="10%">

Node.js Fluent Selenium. Making it simple and easy to automate browser tests.



### Instalation
```
npm install fluenium --save
```
```
yarn add fluenium
```

### Configuration

```js
const webdriver = require("selenium-webdriver");
module.exports = () => {
  return {
    driver: new webdriver.Builder()
      .usingServer(
        "http://seleniumGridServer/wd/hub"
      )
      .withCapabilities({ browserName: "chrome", platform: "ANY" })
      .build()
  };
};

```

### Usage

```js
const browser = require("fluenium");
browser.url("http://google.com")
  .containsText("body", "Images", "css")
  .containsText("body", "Gmail", "css")
  .takeSelfie()
  .write(
    '//*[@id="tsf"]/div[2]/div/div[1]/div/div[1]/input',
    "COOOOOOOL!",
    "xpath"
  )
  .click('//*[@id="tsf"]/div[2]/div/div[3]/center/input[1]', "xpath")
  .takeSelfie();
```
