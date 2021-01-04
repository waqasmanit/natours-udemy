/* eslint-disable */

import '@babel/polyfill' // for enabling new js feature to run in old browser

import { login,logout, signup } from './login';
import { displayMap } from './mapbox';
import { updateSettings } from './updateSettings'
import { bookTour } from './stripe';
//DOM ELEMENTS
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const signupForm = document.querySelector('.form--signup');
console.log('entered  main index');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password'); 
const bookBtn = document.getElementById('book-tour');


if (logOutBtn) logOutBtn.addEventListener('click', logout);

if(mapBox){

const locations = JSON.parse(mapBox.dataset.locations);
displayMap(locations);
}

if(loginForm)
loginForm.addEventListener('submit', e => {
    e.preventDefault(); 
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);

})

if(signupForm){
  signupForm.addEventListener('submit', e => {
    e.preventDefault(); 
    console.log('entered index');
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const role = document.getElementById('role').value;
    signup(name, email,password, confirmPassword, role);

   })
}
if (userDataForm)
  userDataForm.addEventListener('submit', e => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    console.log(form);

    updateSettings(form, 'data');
  });


if (userPasswordForm)
  userPasswordForm.addEventListener('submit', async e => {
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating...';

    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('password-confirm').value;
    await updateSettings(
      { passwordCurrent, password, confirmPassword },
      'password'
    );

    document.querySelector('.btn--save-password').textContent = 'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });

  if (bookBtn)
  bookBtn.addEventListener('click', e => {
    e.target.textContent = 'Processing...';
    const { tourId } = e.target.dataset;
    bookTour(tourId);
  });