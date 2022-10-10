/* Слайдер */ 

const INITIAL_SLIDE_NUMBER = 1;

class Slider {
    constructor(selector, setting = {}) {
        this.slider = document.querySelector(selector);
        this.current = INITIAL_SLIDE_NUMBER;
        this.slideCount = this.slider.children.length;
        this.setting = setting;
    }

    next() {
        if (this.current < this.slideCount) {
            this.current++;
        } else {
            this.current = INITIAL_SLIDE_NUMBER;
        }

        this.translate();
    }

    prev() {
        if (this.current > 1) {
            this.current--;
        } else {
            this.current  = this.slideCount;
        }

        this.translate();
    }

    translate() {
        this.slider.style.transform = `translateX(-${(this.current - 1) * 100}%)`;
    }

    setEventListener() {
        const buttonSliderRight = document.querySelector('.products__slide-arrow--right');
        const buttonSliderLeft = document.querySelector('.products__slide-arrow--left');

        buttonSliderRight.addEventListener('click', () => {
            this.next();
        });

        buttonSliderLeft.addEventListener('click', () => {
            this.prev();
        });
    }

    init() {
        if (!!this.setting.transition) {
            this.slider.style.transition = `${this.setting.transition}ms`;
        }

        if (this.setting.auto) {
            setInterval(() => {
                this.next()
            }, this.setting.autoInterval)
        }

        this.setEventListener();
    }
}

const slider = new Slider('#slider', {
    transition: 1000,
    auto: true,
    autoInterval: 9000,
});

slider.init();

/*Горизонтальный аккордион */

// let teamAccoJS = () => {
//     const team = document.querySelector(".team-accordion"); 

//     team.addEventListener('click', function(e) {
//         e.preventDefault();
//         const link = e.target; //ссылка на которую нажали
//         console.log(link);

//         if (link.classList.contains('.team-accordion__link')) {
//             const activeItem = team.querySelector(".team-accordion__details--active");
//             console.log(activeItem);

//             if (activeItem) { //всегда закрывает активный элемент
//                 let activeText = activeItem.querySelector('.team-accordion__details');
//                 activeText.style.height = "0";
//                 activeItem.classList.remove("team-accordion__details--active");

//             }

//             if (!activeItem || activeItem.querySelector(".team-accordion__link") !== link) {
//                 let currentElement = link.closest(".team-accordion__item");
//                 currentElement.classList.add("team-accordion__details--active");
//                 let currentText = currentElement.querySelector(".team-accordion__details");
//                 console.log(currentText);
//                 currentText.style.height = 100 + "px";
//             }
//         }
//     });
// };

/*Горизонтальный аккордион  костыль*/
let teamAccoJS = () => {
    const teamList = document.querySelector(".team-accordion");

    teamList.addEventListener('click', function(e) {
        e.preventDefault();

        const target = e.target;

        const items = document.querySelectorAll(".team-accordion__item");

        if (target.classList.contains('team-accordion__link')) {
            const item = target.closest(".team-accordion__details");
            if (!item.classList.contains("team-accordion__details--active")) {
                items.forEach(function(currentItem) {
                    currentItem.classList.remove("team-accordion__details--active");
                })
                item.classList.add("team-accordion__details--active");
            } else {
                item.classList.remove("team-accordion__details--active");
            }
        }
    });
};

teamAccoJS();

// $(".team-accordion__link").click((e) => {
//     e.preventDefault();

//     const $this = $(e.currentTarget);
//     const curBlock = $this.closest(".team-accordion__details");

//     curBlock.addClass("team-accordion__details--active").siblings().removeClass("team-accordion__details--active");
// });

/* Отправка формы */
class AjaxForm{
    constructor(selector, settings) {
        this.settings = settings
        this.form = document.querySelector(selector)
        this.fields = this.form.elements
        this.errors = []

        this.form.addEventListener('submit', () => {
            e.preventDefault()

            if(this.isValid()) {
                this.submit()

            }
        })

        this.form.addEventListener('input', (e) => this.validationFild(e.target.name))
    }

    isValid() {
        const validators = this.settings.validators

        if (validators) {
            for (const fieldName in validators) {
                this.validationFild(fieldName)
            }
        }

        if (!this.errors.length) {
            return true
        } else {
            return false
        }
    }

    validationFild(fieldName) {
        if(fieldName && this.settings.validators[fieldName]) {
            try {
                this.settings.validators[fieldName](this.fields[fieldName])
                this.hideError(fieldName)
            } catch (error) {
                this.showEror(fieldName, error.message)
            }
        }
    }

    hideError(fieldName) {
        if (this.errors.length) {
            const field = this.fields[fieldName].closest ? this.fields[fieldName] : this.fields[fieldName][0]
            this.errors = this.errors.filter((field) => field != fieldName)
            field.closest('label').classList.remove('error')
        }
    }

    showError(fieldName, text) {
        if (fieldName) {
            const field = this.fields[fieldName].closest ? this.fields[fieldName] : this.fields[fieldName][0]
            this.errors.push(fieldName)
            field.closest('label').classList.add('error')
            field.placeholder = text
        }
    }

    getJSON() {
        return JSON.stringify(Object.fromEntries(new FormData(this.form)))
    }

    async submit() {
        try {
            var response = await fetch(this.settings.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: this.getJSON()
            })

            var body = await response.json()

            if (response.status >= 400) {
                throw new Error('Ошибка сервера! Что-то пошло не так...')
            }
            this.settings.success(body)
            this.form.reset()
        } catch (error) {
            this.settings.error(error.message)
        }
    }
}

new AjaxForm('#form', {
    url: 'https://webdev-api.loftschool.com/sendmail',
    validators: {
        name: function(field) {
            if (field.value.length < 3) {
                throw new Error('Имя не валидное')
            }
        },
        phone: function(field) {
            if (!field.value.length) {
                throw new Error('Телефон не валидный')
            }
        },
        street: function(field) {
            if (field.value.length < 3) {
                throw new Error('Улица не валидная')
            }
        },
        house: function(field) {
            if (!field.value.length) {
                throw new Error('Дом не валидный')
            }
        },
        housing: function(field) {
            if (!field.value.length) {
                throw new Error('Корпус не валидный')
            }
        },
        flat: function(field) {
            if (!field.value.length) {
                throw new Error('Квартира не валидная')
            }
        },
        floor: function(field) {
            if (!field.value.length) {
                throw new Error('Этаж не валидный')
            }
        },
        isCall: function(field) {
            if (!field.checked) {
                throw new Error('Не выбран чекбокс')
            }
        },
        option: function(field) {
            if (field.value) {
                alert('Оплата картой не доступна')
            }
        },
        comment: function(field) {
            if (!field.value.length) {
                throw new Error('Не заполнен комментарий')
            }
        }
    },
    error: (body) => {
        alert(body)
    },
    success: (body) => {
        alert(body.message)
    }
})

/* Отзывы */
const findBlockByAlias = (alias) => {
    return $(".reviews__item").filter((ndx, item) => {
        return $(item).attr("data-linked-with") === alias;
    });
};

$(".reviews-switcher__link").click((e) => {
    e.preventDefault();

    const $this = $(e.currentTarget);
    const target = $this.attr("data-open");
    const itemToShow = findBlockByAlias(target);
    const curItem = $this.closest(".reviews-switcher__item");

    itemToShow.addClass("reviews__item--active").siblings().removeClass("reviews__item--active");
    curItem.addClass("reviews-switcher__item--active").siblings().removeClass("reviews-switcher__item--active");
});