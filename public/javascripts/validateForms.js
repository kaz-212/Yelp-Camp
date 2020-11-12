// Example starter JavaScript for disabling form submissions if there are invalid fields (copied from bootstrap docs)
;(function () {
  'use strict'

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.validated-form') // .validated-form must be the same class that we gave to the form

  // Loop over them and prevent submission
  // make an array from all the forms, loop over them and add 'submit' event listener.
  // when form submitted run function that checks if the form is valid - if not then preventDefault
  Array.from(forms).forEach(function (form) {
    form.addEventListener(
      'submit',
      function (event) {
        if (!form.checkValidity()) {
          event.preventDefault()
          event.stopPropagation()
        }
        form.classList.add('was-validated')
      },
      false
    )
  })
})()
