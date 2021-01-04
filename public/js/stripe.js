/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';
const stripe = Stripe('pk_test_51I5PgyKYw8n8qH9kcm9ULISrgClHaPTawxUaBzmLTMefshQSrnBp5yLPxXfXlTnFQlHXdC0Q3MEBMmpNMiyABZrA00uTxTOIfI');

export const bookTour = async tourId => {
  try {
    // 1) Get checkout session from API
    const session = await axios(
      `/api/v1/bookings/checkout-session/${tourId}`
    );
   // console.log(session);

    // 2) Create checkout form + chanre credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};