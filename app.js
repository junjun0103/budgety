// budget controller
var budgetController = (function () {
  var Expense = function (id, date, category, description, value) {
    this.id = id;
    this.date = date;
    this.category = category;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function (totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };
  Expense.prototype.getPercentage = function () {
    return this.percentage;
  };

  var Income = function (id, date, category, description, value) {
    this.id = id;
    this.date = date;
    this.category = category;
    this.description = description;
    this.value = value;
  };

  var calculateTotal = function (type) {
    var sum = 0;
    data.allItems[type].forEach(function (cur) {
      sum += cur.value;
    });
    data.totals[type] = sum;
  };

  var data = {
    allItems: {
      exp: [],
      inc: [],
    },
    totals: {
      exp: 0,
      inc: 0,
    },
    budget: 0,
    percentage: -1,
  };

  return {
    addItem: function (date, category, type, des, val) {
      var newItem, ID;
      //CREATE NEW ID
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      // CREATE NEW ITEM BASED ON 'INC' OR 'EXP' TYPE
      if (type === 'exp') {
        newItem = new Expense(ID, date, category, des, val);
      } else if (type === 'inc') {
        newItem = new Income(ID, date, category, des, val);
      }
      //PUSH IT INTO OUR DATE STRUCTURE
      data.allItems[type].push(newItem);
      //RETURN THE NEW ELELMENT
      return newItem;
    },

    deleteItem: function (type, id) {
      var ids, index;
      // data.allItems[type]
      ids = data.allItems[type].map(function (current) {
        // console.log('id:' + current.id);
        return current.id;
      });
      index = ids.indexOf(id);
      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },

    calculateBudget: function () {
      // calculate total income and expenses
      calculateTotal('exp');
      calculateTotal('inc');
      //calculate the budget : income - expenses
      data.budget = data.totals.inc - data.totals.exp;
      // calculate the percentage of income that we spent
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },

    calculatePercentages: function () {
      data.allItems.exp.forEach(function (cur) {
        cur.calcPercentage(data.totals.inc);
      });
    },

    getPercentages: function () {
      var allPerc = data.allItems.exp.map(function (cur) {
        return cur.getPercentage();
      });
      return allPerc;
    },
    getBudget: function () {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage,
      };
    },

    testing: function () {
      console.log(data);
    },
  };
})();

// UIController controller
var UIController = (function () {
  var DOMstrings = {
    inputDate: 'add__date',
    inputCategory: '.add__category',
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputBtn: '.add__btn',
    incomeContainer: '.income__list',
    expensesContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expensesLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    expensesPercLabel: '.item__percentage',
    dateLabel: '.budget__title--month',
  };

  var formatNumber = function (num, type) {
    var numSplit, int, dec;

    // + or - before number. exactly 2 decimal points.
    // comma seperating the thousnads
    num = Math.abs(num);
    num = num.toFixed(2);
    numSplit = num.split('.');
    int = numSplit[0];

    /*
    var digits = integer.length
    var commaCount = Math.floor((integer.length - 1) / 3);
    // Number of commas is always the number of digits minus 1 divided by 3, truncated
    //Start at the end, and count backwards, placing a comma after every third digit Math.floor((digits - 1) / 3)
    for (var i = 1; i <= commaCount ; i++) {
        let loopCount = digits - (3 * i)
        integer = integer.substr(0, loopCount) + `,` + integer.substr(loopCount)
    };
    number = integer + (typeof(numSplit[1]) !== `undefined` ? `.` + numSplit[1] : ``);
    */
    var addComma = function (number) {
      var count = number.length - 3;
      for (var i = Math.floor((number.length - 1) / 3); i > 0; i--) {
        int = int.substr(0, count) + ',' + int.substr(count, int.length);
        count += -3;
      }
    };
    addComma(int);
    dec = numSplit[1];

    return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
  };
  var nodeListForEach = function (list, callback) {
    for (var i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };

  return {
    getInput: function () {
      return {
        date: document.querySelector('.add__date').value,
        category: document.querySelector(DOMstrings.inputCategory).value,
        type: document.querySelector(DOMstrings.inputType).value, // will be either inc or exp
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value),
      };
    },

    addListItem: function (obj, type) {
      var html, newHtml;

      // create HTML string with placeholder text

      if (type === 'inc') {
        element = DOMstrings.incomeContainer;
        html =
          '<div class="item clearfix" id="inc-%id%"> <div> <div class="item__date">%date%</div> <div class="item__category">%category%</div> </div> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"> <i class="ion-ios-close-outline"></i> </button> </div> </div> </div>';
      } else if (type === 'exp') {
        element = DOMstrings.expensesContainer;
        html =
          '<div class="item clearfix" id="exp-%id%"> <div> <div class="item__date">%date%</div> <div class="item__category">%category%</div> </div> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__percentage">21%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
      }

      // replace the placeholder text with some actual data
      newHtml = html.replace('%id%', obj.id);
      newHtml = newHtml.replace('%date%', obj.date);
      newHtml = newHtml.replace('%category%', obj.category);
      newHtml = newHtml.replace('%description%', obj.description);
      newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

      // insert the HTML into the dom
      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
    },

    deleteListItem: function (selectorID) {
      var el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);
    },

    clearFields: function () {
      var fields, fieldsArr;
      fields = document.querySelectorAll(
        DOMstrings.inputDescription + ',' + DOMstrings.inputValue
      );

      fieldsArr = Array.prototype.slice.call(fields);

      fieldsArr.forEach(function (current, index, array) {
        current.value = '';
      });
      fieldsArr[0].focus();
    },

    displayBudget: function (obj) {
      obj.budget > 0 ? (type = 'inc') : (type = 'exp');
      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(
        obj.budget,
        type
      );
      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(
        obj.totalInc,
        'inc'
      );
      document.querySelector(
        DOMstrings.expensesLabel
      ).textContent = formatNumber(obj.totalExp, 'exp');

      if (obj.percentage > 0) {
        document.querySelector(DOMstrings.percentageLabel).textContent =
          obj.percentage + '%';
      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = '---';
      }
    },

    displayPercentages: function (percentages) {
      var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

      nodeListForEach(fields, function (current, index) {
        if (percentages[index] > 0) {
          current.textContent = percentages[index] + '%';
        } else {
          current.textContent = '---';
        }
      });
    },

    displayMonth: function () {
      var now, year, month, months;
      now = new Date();
      year = now.getFullYear();
      months = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];
      month = now.getMonth();
      document.querySelector(DOMstrings.dateLabel).textContent =
        months[month] + ' ' + year;
    },

    displayTodayDate: function () {
      document.getElementById(DOMstrings.inputDate).valueAsDate = new Date();
    },

    changedType: function () {
      var fields = document.querySelectorAll(
        DOMstrings.inputType +
          ',' +
          DOMstrings.inputDescription +
          ',' +
          DOMstrings.inputValue
      );

      nodeListForEach(fields, function (cur) {
        cur.classList.toggle('red-focus');
      });
      document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
    },

    getDOMstrings: function () {
      return DOMstrings;
    },
  };
})();

var login = (function () {
  var DOMstrings = {
    btnLogin: '.btn__login',
    btnSignUP: '.btn__signUP',
    btnLogout: '.btn__logout',
    checkRemember: 'checkbox',
    beforeLogin1: '.beforeLogin__signUP',
    beforeLogin2: '.beforeLogin__login',
    afterLogin1: '.afterLogin__userID',
    afterLogin2: '.afterLogin__logout',
  };

  var navBarBtnChange = function () {
    document
      .querySelector(DOMstrings.beforeLogin1)
      .classList.toggle('inactive');
    document
      .querySelector(DOMstrings.beforeLogin2)
      .classList.toggle('inactive');
    document.querySelector(DOMstrings.afterLogin1).classList.toggle('inactive');
    document.querySelector(DOMstrings.afterLogin2).classList.toggle('inactive');
  };

  var toggleSignOut = function () {
    // [START signout]
    firebase.auth().signOut();
    // [END signout]
    //end session
    sessionStorage.clear();
    navBarBtnChange();
  };

  var toggleSignIn = function (email, password) {
    // Sign in with email and pass.
    // [START authwithemail]
    firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .catch(function (error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // [START_EXCLUDE]
        if (errorCode === 'auth/wrong-password') {
          alert('Wrong password.');
        } else {
          alert(errorMessage);
        }
        console.log(error);
        // [END_EXCLUDE]
      })
      .then((result) => {
        var user = firebase.auth().currentUser;
        var name, email, uid;
        if (result.operationType === 'signIn') {
          name = user.displayName;
          email = user.email;
          uid = user.uid;
          //setup session
          sessionStorage.setItem('email', email);
          sessionStorage.setItem('uid', uid);
          // change navbar buttons
          navBarBtnChange();
        } else {
        }
      });
    // [END authwithemail]
  };

  var handleSignUp = function (email, password) {
    if (password.length < 4) {
      alert('Please enter a password.');
      return;
    }
    // Create user with email and pass.
    // [START createwithemail]
    firebase
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .catch(function (error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // [START_EXCLUDE]
        if (errorCode == 'auth/weak-password') {
          alert('The password is too weak.');
        } else {
          alert(errorMessage);
        }
        console.log(error);
        // [END_EXCLUDE]
      });
    // [END createwithemail]
  };

  var loginPopup = function () {
    Swal.fire({
      title: 'LOGIN',
      html:
        '<input type="email" id="username" class="swal2-input" placeholder="Enter your email" required></input>' +
        '<input type="password" id="password" class="swal2-input" placeholder="Enter your password" required></input>' +
        '<input type="checkbox" id="checkboxRemember" class="input-remember" placeholder="Enter your password" required></input><label for="checkboxRemember">remember me</label>' +
        '<br/><a href="forgotPasswrod.html" >forgot password</a>',
      confirmButtonText: 'Login',
      preConfirm: () => {
        let username = Swal.getPopup().querySelector('#username').value;
        let password = Swal.getPopup().querySelector('#password').value;
        let checkboxRemember = Swal.getPopup().querySelector(
          '#checkboxRemember'
        ).value;
        if (username === '' || password === '') {
          Swal.showValidationMessage(`Username/Password empty`);
        }
        console.log(checkboxRemember);
        return { username: username, password: password };
      },
    }).then((result) => {
      toggleSignIn(result.value.username, result.value.password);
    });
  };

  var signUpPopup = function () {
    Swal.fire({
      title: 'SIGNUP',
      html:
        '<input type="email" id="username" class="swal2-input" placeholder="Enter your username" required></input>' +
        '<input type="password" id="password" class="swal2-input" placeholder="Enter your password" required></input>',
      confirmButtonText: 'SignUP',
      preConfirm: () => {
        let username = Swal.getPopup().querySelector('#username').value;
        let password = Swal.getPopup().querySelector('#password').value;
        if (username === '' || password === '') {
          Swal.showValidationMessage(`Username/Password empty`);
        }
        return { username: username, password: password };
      },
    }).then((result) => {
      handleSignUp(result.value.username, result.value.password);
      // Swal.fire(
      //   `Username: ${result.value.username}\nPassword: ${result.value.password}`
      // );
    });
  };

  return {
    setupEventListeners: function () {
      document
        .querySelector(DOMstrings.btnLogin)
        .addEventListener('click', loginPopup);
      document
        .querySelector(DOMstrings.btnSignUP)
        .addEventListener('click', signUpPopup);
      document
        .querySelector(DOMstrings.btnLogout)
        .addEventListener('click', toggleSignOut);
    },
    loginStatus: function () {
      var n = sessionStorage.getItem('email');
      if (n !== null) {
        navBarBtnChange();
      }
    },
  };
})();

// global app controller
var controller = (function (budgetCtrl, UICtrl) {
  var setupEventListeners = function () {
    var DOM = UIController.getDOMstrings();

    document.querySelector(DOM.inputBtn).addEventListener('click', ctrAddItem);

    document.addEventListener('keypress', function (event) {
      // console.log(event);
      if (event.keyCode === 13 || event.which === 13) {
        ctrAddItem();
      }
    });

    document
      .querySelector(DOM.container)
      .addEventListener('click', ctrlDeleteItem);

    document
      .querySelector(DOM.inputType)
      .addEventListener('change', UIController.changedType);
  };

  var updateBudget = function () {
    // 1. calculate the budget
    budgetController.calculateBudget();
    // 2. return the budget
    var budget = budgetController.getBudget();
    // 3. display the budget on the ui
    UIController.displayBudget(budget);
  };

  var updatePercentages = function () {
    // 1. calculate percentages
    budgetController.calculatePercentages();
    // 2. read percentages from the budget controller
    var percentages = budgetController.getPercentages();
    // 3. update the UI with the new percentages
    UIController.displayPercentages(percentages);
  };

  var ctrAddItem = function () {
    // 1. get the filed input data
    var input = UIController.getInput();

    if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
      // 2. add the item to the budget controller
      var newItem = budgetController.addItem(
        input.date,
        input.category,
        input.type,
        input.description,
        input.value
      );
      // 3. add the item to the UI
      UIController.addListItem(newItem, input.type);
      // 4. clear the field
      UIController.clearFields();

      // 5. calculate and update budget
      updateBudget();

      // 6. calculate and update percentages
      updatePercentages();
    }
  };

  var ctrlDeleteItem = function (event) {
    var itemID, splitID, type, ID;

    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
    if (itemID) {
      splitID = itemID.split('-');
      type = splitID[0];
      ID = parseInt(splitID[1]);

      // 1. delete the item from the data structure
      budgetController.deleteItem(type, ID);
      // 2. delete the item from the UI
      UIController.deleteListItem(itemID);
      // 3. update and show the new budget
      updateBudget();
      // 4. calculate and update percentages
      updatePercentages();
    }
  };

  return {
    init: function () {
      UIController.displayMonth();
      UIController.displayTodayDate();
      UIController.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1,
      });
      setupEventListeners();
      login.setupEventListeners();
      login.loginStatus();
    },
  };
})(budgetController, UIController);

controller.init();
