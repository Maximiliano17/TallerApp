'use strict';

const container = document.querySelector('#container');
const btn = document.querySelector('#button-edit');
const containerEdit = document.querySelector('#edit-form');
const contenedorForm = document.querySelector('.contenedor-form');
const formulario = document.querySelector('.formulario-de-edicion');
const close = document.querySelector('btn-close');

btn.addEventListener('click', () => {
    containerEdit.classList.add('active');
    container.style.filter = 'blur(2px)';
});

containerEdit.addEventListener('click', (e) => {
    let target = e.target;

    console.log(target);

    if(target == contenedorForm) {
        containerEdit.classList.remove('active');
        container.style.filter = 'blur(0)';
    }

})

function clicked() {
    container.style.filter = 'blur(0)';
    containerEdit.classList.remove('active');
}