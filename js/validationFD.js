//////////////////////////////////////////////
/// ValidationForDummies.js
///-------------------------
/// This JavaScript Library is used for building
/// form validations.
/// https://github.com/anthonymavila/validationFD

var ValidationFD = function (params) {
 this.form_id = params.form;
 this.rules = params.rules;
 this.messages = [];
 this.fields = null;
 this.validation_history = []; //log of all validation attempts.. can be saved to server for analysis
 this.active_test = {
  timestamp: null,
  errors: [],
  status: true
 };

 for ( message in params.messages ) {
  this.messages[ params.messages[message][0] ] = params.messages[message][1];
 }



 document.getElementById(this.form_id).addEventListener('submit', function(e){
  e.preventDefault();
  if ( this.validate() == true ) {
    e.preventDefault();
  } else {
    e.preventDefault();
  }
 }.bind(this), false);

};

ValidationFD.prototype.reset_test = function() {
  this.validation_history[this.validation_history.length] = this.active_test;
  this.active_test = {
    form_id: this.form_id,
    timestamp: null,
    errors: [],
    status: true,
    add_error: function(m, field, command) {
      var that = window[this.form_id];
      if ( that.messages[field+"|"+command] ){
        this.errors[this.errors.length] = that.messages[field+"|"+command];
      } else {
        this.errors[this.errors.length] = m;
      }
    }
   };
}

ValidationFD.prototype.validate = function( rules, messages ) {
  this.reset_test();
  validation_flags = [];
  for ( var rule in this.rules ) {
    var is_valid = true;
    var mode = null;
    var field_id = this.rules[rule][0];
    var requirements = this.rules[rule][1].split("|");
    //console.log(field_id, requirements)
    for ( requirement = requirements.length-1; requirement >= 0;requirement-- ) {
      //console.log("starting", requirements[requirement]);
      //first check for built in requirements.
      if ( requirements[requirement] == "require" ) {
        var field_val = document.getElementById(field_id).value;
        if( field_val === null || field_val === "" ) {
                  //requirements.splice(requirement);

          this.active_test.add_error( field_id+" is required.", field_id, requirements[requirement] );
          break;
        }
        requirements.splice(requirement, 1);
      }
      if ( requirements[requirement] == "nullable" ) {
        var field_val = document.getElementById(field_id).value;
        if( field_val === null || field_val === "" ) {
          //its okay to be null..
          break;
        }
        requirements.splice(requirement, 1);
      }

      //next check plugin validations
      if( typeof window[this.form_id]["validate_"+requirements[requirement]] === "function" ) {
        if( mode ) {
          console.log("error: duplicate types declared", this.rules[rule][1])
        } else {
          var mode = requirements[requirement];
        }
        requirements.splice(requirement, 1);
      }

    }
    //console.log("validating ", field_id, " using ", mode, "with", requirements);
    //call the mode function
    validation = this.run_validation(field_id, mode, requirements);

    if ( validation ) {
      this.accept_field( field_id );
    } else {
      this.reject_field( field_id );
    }
  }

  if ( this.active_test.errors.length > 0 ) {
    errorcodes = "";
    console.log("validation results", this.active_test.errors);
    for ( e in this.active_test.errors ) {
      errorcodes += "<div class='alert alert-danger'>"+this.active_test.errors[e]+"</div>";
    }
    document.getElementById("error-screen").innerHTML = errorcodes;
    document.getElementById("error-screen").style.display = "block";
    return false;
  } else {
    return true;
  }
}


ValidationFD.prototype.run_validation = function( field, type, requirements ) {
  var validation_type = window[this.form_id]["validate_"+type];
  if ( typeof validation_type !== 'function' ) {
    console.log("error: validation type "+validation_type+" could not be found.");
    return false;
  } else {
    return validation_type.bind(this).apply(window, [field, requirements]);
  }
}

ValidationFD.prototype.accept_field = function( field ) {
  if ( document.getElementById(field) ) {
    document.getElementById(field).classList.remove("rejected_input");
    document.getElementById(field).classList.add("accepted_input");
  } else if ( document.querySelector("[name='"+field+"']") ) {
    document.querySelector("[name='"+field+"']").parentElement.classList.remove("rejected_input");
    document.querySelector("[name='"+field+"']").parentElement.classList.add("accepted_input");
  }
}

ValidationFD.prototype.reject_field = function( field ) {
  if ( document.getElementById(field)) {
    document.getElementById(field).classList.remove("accepted_input");
    document.getElementById(field).classList.add("rejected_input");
  } else if ( document.querySelector("[name='"+field+"']") ) {
    document.querySelector("[name='"+field+"']").parentElement.classList.remove("accepted_input");
    document.querySelector("[name='"+field+"']").parentElement.classList.add("rejected_input");
  }
}

ValidationFD.prototype.validate_template = function( input, requirements ) {
  for( requirement in requirements ) {
    var meets_requirement = true;
    var params = requirements[requirement].split(":");
    var val = document.getElementById(input).value;
    switch( params[0] ) {
      case "[command_name]":
        command_args = params[1];
        if ( val.length > parseInt(params[1]) ) {
          this.active_test.add_error("this field ("+input+") has error ("+params[0]+")", field_id, params[0]);
          meets_requirement = false;
        }
      break;
    }
    if( meets_requirement === true ) {
      continue;
    } else {
      return false;
    }
  }
  return true;
}


ValidationFD.prototype.validate_string = function( input, requirements ) {
  for( requirement in requirements ) {
    var meets_requirement = true;
    var params = requirements[requirement].split(":");
    var val = document.getElementById(input).value;
    switch( params[0] ) {
      case "max":
        if ( val.length > parseInt(params[1]) ) {
          this.active_test.add_error("this field ("+input+") has error ("+params[0]+")", input, params[0]);
          meets_requirement = false;
        }
      break;
      case "min":
        if ( val.length < parseInt(params[1]) ) {
          this.active_test.add_error("this field ("+input+") has error ("+params[0]+")", input, params[0]);
          meets_requirement = false;
        }
      break;
      case "in":
        in_flag = false;
        allowed = params[1].split(",");
        for ( value in allowed ) {
          if( allowed[value] == val ) {
            in_flag = true;
          }
        }
        if ( in_flag == false ) {
          this.active_test.add_error("this field ("+input+") has error ("+params[0]+")", input, params[0]);
          meets_requirement = false;
        }
      break;
      case "equals":
        if ( val != params[1] ) {
          this.active_test.add_error("this field ("+input+") has error ("+params[0]+")", input, params[0]);
          meets_requirement = false;
        }
      break;
      case "between":
        range = params[1].split(",")
        if ( val.length > range[1] || val.length < range[0] ) {
          this.active_test.add_error("this field ("+input+") has error ("+params[0]+")", input, params[0]);
          meets_requirement = false;
        }
      break;
    }

    if( meets_requirement === true ) {
      continue;
    } else {
      return false;
    }
  }
  return true;
}

ValidationFD.prototype.validate_numeric = function( input, requirements ) {
  var val = document.getElementById(input).value;
  if( isNaN(val) ) {
    this.active_test.add_error("this field ("+input+") has error. Value must be numeric.", input, "numeric");
    return false;
  }
  for( requirement in requirements ) {
    var meets_requirement = true;
    var params = requirements[requirement].split(":");
    switch( params[0] ) {
      case "integer":
        if ( ! Number.isInteger(parseFloat(val)) ) {
          this.active_test.add_error("this field ("+input+") has error. Value must be an integer.", input, "integer");
          meets_requirement = false;
        }
      break;
      case "max":
        if ( parseFloat(val) > parseFloat(params[1]) ) {
          this.active_test.add_error("this field ("+input+") has error ("+params[0]+")", input, params[0]);
          meets_requirement = false;
        }
      break;
      case "min":
        if ( parseFloat(val) < parseFloat(params[1]) ) {
          this.active_test.add_error("this field ("+input+") has error ("+params[0]+")", input, params[0]);
          meets_requirement = false;
        }
      break;
      case "in":
        in_flag = false;
        allowed = params[1].split(",");
        for ( value in allowed ) {
          if( parseFloat(allowed[value]) == parseFloat(val) ) {
            in_flag = true;
          }
        }
        if ( in_flag == false ) {
          this.active_test.add_error("this field ("+input+") has error ("+params[0]+")", input, params[0]);
          meets_requirement = false;
        }
      break;
      case "equals":
        if ( parseFloat(val) != parseFloat(params[1]) ) {
          this.active_test.add_error("this field ("+input+") has error ("+params[0]+")", input, params[0]);
          meets_requirement = false;
        }
      break;
      case "between":
        range = params[1].split(",")
        if ( parseFloat(val) > range[1] || parseFloat(val) < range[0] ) {
          this.active_test.add_error("this field ("+input+") has error ("+params[0]+")", input, params[0]);
          meets_requirement = false;
        }
      break;
    }

    if( meets_requirement === true ) {
      continue;
    } else {
      return false;
    }
  }
  return true;
}

ValidationFD.prototype.validate_phone = function( input, requirements ) {
  var val = document.getElementById(input).value;
  if ( val.match(/\d/g).length == 10 ) {
    return true;
  } else {
    this.active_test.add_error("this field ("+input+") has error. Phone number must be valid 10 digit number.", input, "phone");
    return false;
  }
}

ValidationFD.prototype.validate_email = function( input, requirements ) {
  var val = document.getElementById(input).value;
  var rgx = /\S+@\S+\.\S+/;
  if ( rgx.test(val) ) {
    return true;
  } else {
    this.active_test.add_error("this field ("+input+") has error. Phone number must be valid email address.", input, "email");
    return false;
  }
}

ValidationFD.prototype.validate_date = function( input, requirements ) {
  var val = document.getElementById(input).value;
  var rgx = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
  if ( rgx.test(val) ) {
    var parts = val.split("/");
    var m = parseInt(parts[0], 10);
    var d = parseInt(parts[1], 10);
    var y = parseInt(parts[2], 10);
    if ( y < 1000 || y >3000 || m == 0 || m > 12 ) {
      this.active_test.add_error("this field ("+input+") has error. Invalid date.", input, "date");
      return false;
    } else {
      return true;
    }
  } else {
    this.active_test.add_error("this field ("+input+") has error. Date must be in MM/DD/YYYY format.", input, "date");
    return false;
  }
}



ValidationFD.prototype.validate_checkbox = function( input, requirements ) {
  var val = document.getElementById(input).checked;
  if ( val == true ) {
    return true;
  } else {
    this.active_test.add_error("this field ("+input+") has error. Please check this field.", input, "checkbox");
    return false;
  }
}

ValidationFD.prototype.validate_radio = function( input, requirements ) {
  var val = document.querySelector("[name='"+input+"']").value
  for( requirement in requirements ) {
    var meets_requirement = true;
    var params = requirements[requirement].split(":");
    switch( params[0] ) {
      case "in":
        in_flag = false;
        allowed = params[1].split(",");
        for ( value in allowed ) {
          if( allowed[value] == val ) {
            in_flag = true;
          }
        }
        if ( in_flag == false ) {
          this.active_test.add_error("this field ("+input+") has error ("+params[0]+")", input, params[0]);
          meets_requirement = false;
        }
      break;
      case "equals":
        if ( val != params[1] ) {
          this.active_test.add_error("this field ("+input+") has error ("+params[0]+")", input, params[0]);
          meets_requirement = false;
        }
      break;
      case "between":
        range = params[1].split(",")
        if ( val.length > range[1] || val.length < range[0] ) {
          this.active_test.add_error("this field ("+input+") has error ("+params[0]+")", input, params[0]);
          meets_requirement = false;
        }
      break;
    }

    if( meets_requirement === true ) {
      continue;
    } else {
      return false;
    }
  }
  return true;
}