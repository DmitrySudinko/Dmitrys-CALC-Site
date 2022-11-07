import * as Model from "./model.js";
import updateResultsView from "./view/updateResultsView.js"
import programs from './view/radioPrograms.js';
import { updateMinPercents } from "./view/utils.js";

import costInput from './view/costInput.js';
import costRange from './view/costRange.js';

import paymentInput from './view/paymentInput.js';
import paymentRange from './view/paymentRange.js';

import timeInput from './view/timeInput.js';
import timeRange from './view/timeRange.js';

window.onload = function() {
    
    const getData = Model.getData;

    // init programs
    programs(getData);
    
    // init cost input
    const cleaveCost = costInput(getData);
    const sliderCost = costRange(getData);
    
    // Init Payent input
    const cleavePayment = paymentInput(getData);
    const sliderPayment = paymentRange(getData);
    
    // init time
    const cleaveTime = timeInput(getData);
    const sliderTime = timeRange(getData);

    Model.setData({});
    const results = Model.getResults();
    updateResultsView(results);

    document.addEventListener('updateForm', (e) => {

        Model.setData(e.detail);

        const data = Model.getData();
        const results = Model.getResults();

        // Update all form view based on model
        updateFormAndSliders(data);

        // Updated results block
        updateResultsView(results);

    })

    function updateFormAndSliders(data) {
        // Update radio Buttons
        if (data.onUpdate === 'radioProgram') {
            updateMinPercents(data);

            // Update payment slider
            sliderPayment.noUiSlider.updateOptions({
                range: {
                    min: data.minPaymentPercents * 100,
                    max: data.maxPaymentPercents * 100,
                }
            })
        }


        // costInput
        if (data.onUpdate !== 'inputCost') {
            // console.log('UPDATE INPUT COST');
            cleaveCost.setRawValue(data.cost);
        }
        //costSlider
        if (data.onUpdate !== 'costSlider') {
            // console.log('UPDATE COST Slider');
            sliderCost.noUiSlider.set(data.cost);
        }

        // PaymentInput
        if (data.onUpdate !== 'inputPayment') {
            cleavePayment.setRawValue(data.payment);

        }
        //paymentSlider
        if (data.onUpdate !== 'paymentSlider') {

            sliderPayment.noUiSlider.set(data.paymentPercents * 100);
        }
        // timeInput
        if (data.onUpdate !== 'inputTime') {
            cleaveTime.setRawValue(data.time);
        }
        // timeSlider
        if (data.onUpdate !== 'timeSlider') {
            sliderTime.noUiSlider.set(data.time);
        }
        

    }

    // Order Form
    const openFormBtn = document.querySelector('#openFormBtn');
    const orderForm = document.querySelector('#orderForm');
    const submitFormBtn = document.querySelector('#submitFormBtn');

    openFormBtn.addEventListener('click', () => {
        orderForm.classList.remove('none');
        openFormBtn.classList.add('none');
    });

    orderForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // собираем наддные перед disable button
        const formData = new FormData(orderForm);
        console.log(formData);
        console.log(formData.get('name'));

        // Disable buttons

        submitFormBtn.setAttribute('disabled', true);
        submitFormBtn.innerText = 'Заявка отправляется...';

        orderForm.querySelectorAll('input').forEach(function(input) {
            input.setAttribute('disabled', true);

        })

        fetchData();

        async function fetchData() {
            const data = Model.getData();
            const results = Model.getResults();

            let url = checkOnUrl(document.location.href);
            // console.log(url);

            function checkOnUrl(url) {
                let urlArrayDot = url.split('.');
                if (urlArrayDot[urlArrayDot.length -1] === 'html') {
                    urlArrayDot.pop();
                    let newUrl = urlArrayDot.join('.');
                    let urlArraySlash = newUrl.split('/');
                    urlArraySlash.pop();
                    newUrl = urlArraySlash.join('/');
                    console.log(newUrl);
                }

                return url;

            }

            const response = await fetch(url + 'mail.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8',
                },
                body: JSON.stringify({
                    form: {
                        name: formData.get('name'),
                        email: formData.get('email'),
                        phone: formData.get('phone')
                    },
                    data,
                    results,
                }),
            });

            const result = await response.text();

            console.log(result);

            submitFormBtn.removeAttribute('disabled', true);
            submitFormBtn.innerText = 'Оформить заявку';

            orderForm.querySelectorAll('input').forEach(function(input) {
                input.removeAttribute('disabled', true);
    
            });

            // Reset forms
            orderForm.reset();
            orderForm.classList.add('none');

            // На основе ответа сервера
            if (result === 'SUCCESS') {
                document.getElementById('success').classList.remove('none');
            } else {
                document.getElementById('error').classList.remove('none');
            }
     

        }

    });


}