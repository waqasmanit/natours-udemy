/* eslint-disable */

 import axios from 'axios';

 import {showAlert} from './alerts.js'
 export const login = async (email, password) => {
   // alert(`${email}/ ${password}`);
     console.log(email, password);
    try {
        const res = await axios({
            method: 'POST',
            url: '/api/v1/users/login',
            data: {
                email,
                password
            }
        });
        
        if (res.data.status === 'success') {
            showAlert('success','Logged in successfully!');
            window.setTimeout(() => {
              location.assign('/');
            }, 1500);
          }
        } catch (err) {
          showAlert('error',err.response.data.message);
        }

}

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout'
    });
    if ((res.data.status = 'success')) location.reload(true);
  } catch (err) {
    console.log(err.response);
    showAlert('error', 'Error logging out! Try again.');
  }
};

export const signup = async (name, email,password, confirmPassword, role)=>{
  console.log("enterred axios");
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/signup',
      data : {
        name,
        email,
        password,
        confirmPassword,
        role,
      }
    });
    if (res.status = 'success'){
      console.log('response from api',res);
      showAlert('success','Signed Up successfully !!');
      window.setTimeout(() => {
        location.assign('/login');
      }, 2000);
    }
  } catch (err) {
    //console.log('error occured',err.response.data.message);
    if(err.response.data.error.name=='MongoError'){
      showAlert('error', 'Email already exist');
    }
    else
    showAlert('error', err.response.data.message.split(':')[2]);
  }
}