const webdriver = require("selenium-webdriver"),
  By = webdriver.By,
  until = webdriver.until;

let driverSetup = require(process.cwd() + "/" + "fluent_driver_setup")();
let driver = driverSetup.driver;

const log = () => {}; //console.log;; //log;

const __takeScreenshot = () => {
  return new Promise(res => {
    driver
      .takeScreenshot()
      .then((img, err) => {
        this.images.push(img);
        err ? rej(err) : res(img);
      })
      .catch(err => rej(err));
  });
};
const __findElement = () => {};
const __waitUntilVisible = () => {};
const __title = () => {
  return new Promise((resolve, reject) => {
    log("EXPECTED PAGE TITLE:", this.state.pageTitle);
    driver
      .getTitle()
      .then(title => {
        log("ACTUAL PAGE TITLE:", title);

        if (title && title === this.state.pageTitle) {
          resolve(title);
        } else {
          reject(
            `Title does not match: \nExpected: ${
              this.state.pageTitle
            } ---> Got: ${title}`
          );
        }
      })
      .catch(reject);
  });
};
const __getText = () => {
  return new Promise((resolve, reject) => {
    driver
      .findElement(By[this.state.selectorType](this.state.element))
      .getAttribute("value")
      .then(text => {
        log("GOT TEXT FROM ELEMENT, TEXT: ", text);
        resolve(text);
      })
      .catch(reject);
  });
};
const __switchWindow = () => {
  return new Promise((resolve, reject) => {
    driver.getAllWindowHandles.catch(reject);
  });
};
const __containsText = () => {
  return new Promise((res, rej) => {
    log("THISSSSS ::::: ", this);
    driver
      .findElement(By[this.state.selectorType](this.state.element))
      .then((elm, err) => {
        elm
          .getText()
          .then(str => {
            str.includes(this.state.textToCompare)
              ? (() => {
                  log("Element Contains Text");
                  res(true);
                })()
              : rej(
                  new Error(
                    "Got : " +
                      str +
                      " -->  Expectd: " +
                      this.state.textToCompare
                  )
                );
          })
          .catch(err => rej(err));
      });
  });
};
const __pause = () => {
  return new Promise((res, rej) => {
    log("PAUSE");
    driver.sleep(this.state.pauseFor).then(r => {
      res("Done Sleeping");
    });
  });
};
const __waitForElement = () => {
  return new Promise((res, rej) => {
    log("Wait for Elelemnt : ", this.state.element);
    log("With Selector : ", this.state.selectorType);
    log("Timeout After : ", this.state.waitFor);
    driver
      .wait(
        until.elementLocated(By[this.state.selectorType](this.state.element)),
        this.state.waitFor || 50000
      )
      .then(foundElement => {
        log("The element was found? ", foundElement);
        driver.sleep(350).then(r => {
          res(foundElement);
        });
      })
      .catch(error => {
        rej(error);
      });
  });
};

const __focusOn = () => {
  return new Promise((res, rej) => {
    log("BY:::::", this.state.selectorType);
    driver
      .findElement(By[this.state.selectorType](this.state.element))
      .then(elm => {
        elm.click().then(r => res(r));
      })
      .catch(err => rej(err));
  });
};
const __click = () => {
  return new Promise((res, rej) => {
    log("CLICK BY:::::", this.state.selectorType);
    driver
      .findElement(By[this.state.selectorType](this.state.element))
      .then((elm, err) => {
        elm.click().then(r => res(r));
      })
      .catch(err => rej(err));
  });
};
const __write = () => {
  return new Promise((res, rej) => {
    log("BY:::::", this.state.selectorType);
    log("SEND KEYS:::::", this.state.keys);
    driver
      .findElement(By[this.state.selectorType](this.state.element))
      .then((elm, err) => {
        log("SENDING KEYS ::", this.state.keys);

        elm.sendKeys(this.state.keys).then(r => {
          log("KEYS SENT !!");
          log(r);
          res(r);
        });
      })
      .catch(err => rej(err));
  });
};
const __endStep = data => {
  return new Promise((res, rej) => {
    log("End Of Step ####");
    log("GOT DATA on END OF STEP: ", data);
    res(this.state.clbk(data));
  });
};
const __handleError = error => {
  //rej(new Error(error));
  throw new Error(error);

  //res(new Error(error));
};

const __withPage = () => {
  return new Promise((res, rej) => {
    log("BY:::::", this.state.selectorType);
    res(this.state.clbk());
  });
};

const MyApi = (previousActions = Promise.resolve()) => {
  this.images = [];
  this.__hydrateState = newState => {
    log("STATE HHYDRATE ::: ", newState);
    return MyApi(
      previousActions
        .then(
          new Promise((res, rej) => {
            this.state = newState;
            res(true);
          })
        )
        .catch(__handleError)
    );
  };
  this.__hydratePage = newPage => {
    log("Page HHYDRATE ::: ", newPage);
    return MyApi(
      previousActions.then(
        new Promise((res, rej) => {
          this.currentPage = newPage;
          res(this.currentPage);
        })
      )
    );
  };
  this.url = url => MyApi(driver.get(url));
  this.takeSelfie = () =>
    MyApi(previousActions.then(__takeScreenshot).catch(__handleError));
  this.getShot = cb =>
    MyApi(
      previousActions
        .then(driver.sleep(300))
        .then(__takeScreenshot)
        .then(cb)
    );

  this.withPage = pageObject => {
    return MyApi(
      previousActions.then(
        this.__hydratePage.bind(null, { newPage: pageObject })
      )
    );
  };
  this.title = expectedTitle => {
    return MyApi(
      previousActions
        .then(this.__hydrateState.bind(null, { pageTitle: expectedTitle }))
        .then(__title)
    );
  };
  this.waitForElement = (element, selectorType = "css", waitFor = 600000) => {
    return MyApi(
      previousActions
        .then(
          this.__hydrateState.bind(null, {
            element: element,
            selectorType: selectorType,
            waitFor: waitFor
          })
        )
        .then(__waitForElement)
    );
  };
  this.containsText = (element, textToCompare, selectorType = "css") => {
    return MyApi(
      previousActions
        .then(
          this.__hydrateState.bind(null, {
            textToCompare: textToCompare,
            element: element,
            selectorType: selectorType
          })
        )
        .then(__containsText)
    );
  };
  this.focusOn = (element, selectorType = "css") => {
    return MyApi(
      previousActions
        .then(
          this.__hydrateState.bind(null, {
            element: element,
            selectorType: selectorType
          })
        )
        .then(__focusOn)
    );
  };
  this.pause = pauseFor => {
    return MyApi(
      previousActions
        .then(
          this.__hydrateState.bind(null, {
            pauseFor: pauseFor
          })
        )
        .then(__pause)
    );
  };
  this.write = (element, text, selectorType = "css") => {
    return MyApi(
      previousActions
        .then(
          this.__hydrateState.bind(null, {
            element: element,
            keys: text,
            selectorType: selectorType
          })
        )
        .then(__write)
    );
  };
  this.click = (element, selectorType = "css") => {
    return MyApi(
      previousActions
        .then(
          this.__hydrateState.bind(null, {
            element: element,
            selectorType: selectorType
          })
        )
        .then(__click)
    );
  };
  this.endStep = clbk => {
    return MyApi(
      previousActions
        .then(
          this.__hydrateState.bind(null, {
            clbk: clbk
          })
        )
        .then(__endStep)
    );
  };
  this.getText = (element, matcher, selectorType = "css") => {
    return MyApi(
      previousActions
        .then(
          this.__hydrateState.bind(null, {
            element: element,
            matcher: matcher,
            selectorType: selectorType
          })
        )
        .then(__getText)
        .then(matcher)
    );
  };
  this.toPromise = () => previousActions.catch(__handleError);
  return this;
};

module.exports = MyApi;
