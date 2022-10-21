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

/* Вертикальный аккордион */

const openTeamItem = (item) => {
    const container = item.closest(".team__item");
    const contentBlock = container.find(".team__content");
    const textBlock = contentBlock.find(".team__content-block");
    const reqHeight = textBlock.height();

    container.addClass("team__content--active");
    contentBlock.height(reqHeight);
};

const closeEveryItem = (container) => {
    const items = container.find('.team__content');
    const itemContainer = container.find(".team__item");

    itemContainer.removeClass("team__content--active");
    items.height(0);
}

$('.team__title').click(e => {
    const $this = $(e.currentTarget);
    const container = $this.closest('.team');
    const elemContainer = $this.closest('.team__item');

    if (elemContainer.hasClass("team__content--active")) {
        closeEveryItem(container);
    } else {
        closeEveryItem(container);
        openTeamItem($this);
    }
}); 

/* Горизонтальный аккордион */
const mesureWidth = item => {
    let reqItemWidth = 0;

    const screenWidth = $(window).width();
    const container = item.closest(".products-menu");
    const titlesBlocks = container.find(".products-menu__title");
    const titlesWidth = titlesBlocks.width() * titlesBlocks.length;

    const textContainer = item.find(".products-menu__container");
    const paddingLeft = parseInt(textContainer.css("padding-left"));
    const paddingRight = parseInt(textContainer.css("padding-right"));

    const isMobile = window.matchMedia("(max-width: 768px)").matches;

    if (isMobile) {
        reqItemWidth = screenWidth - titlesWidth;
    } else {
        reqItemWidth = 524;
    }

    return {
        container: reqItemWidth,
        textContainer: reqItemWidth - paddingLeft - paddingRight
    }
};

const closeEveryItemInContainer = container => {
    const items = container.find(".products-menu__item");
    const content = container.find(".products-menu__content");

    items.removeClass("active");
    content.width(0);
}

const openItem = item => {
    const hiddenContent = item.find(".products-menu__content");
    const reqWidth = mesureWidth(item);
    const textBlock = item.find(".products-menu__container");

    item.addClass("active");
    hiddenContent.width(reqWidth.container);
    textBlock.width(reqWidth.textContainer);
}

$(".products-menu__title").on("click", e => {
    e.preventDefault();

    const $this = $(e.currentTarget);
    const item = $this.closest(".products-menu__item");
    const itemOpened = item.hasClass("active");
    const container = $this.closest(".products-menu");

    if (itemOpened) {
        closeEveryItemInContainer(container);
    } else {
        closeEveryItemInContainer(container);
        openItem(item);
    }
});

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

/* Плеер */

let player;
const playerContainer = $('.player');

let eventsInit = () => {
    $(".player__start").click(e => {
        e.preventDefault();

        if (playerContainer.hasClass("paused")) {
            player.pauseVideo();
        } else {
            player.playVideo();
        }
    });

    $(".player__playback").click(e => {
        const bar = $(e.currentTarget);
        const clickedPosition = e.originalEvent.layerX;
        const newButtonPositionPercent = (clickedPosition / bar.width()) * 100;
        const newPlaybackPositionSec = (player.getDuration() / 100) * newButtonPositionPercent;

        $(".player__playback-button").css({
            left: `${newButtonPositionPercent}%`
        });

        player.seekTo(newPlaybackPositionSec);
    });

    $(".player__splash").click(e => {
        player.playVideo();
    });
};

const formatTime = timeSec => {
    const roundTime = Math.round(timeSec);

    const minutes = addZero(Math.floor(roundTime / 60));
    const seconds = addZero(roundTime - minutes * 60);
    
    function addZero(num) {
        return num < 10 ? `0${num}` : num;
    }

    return `${minutes} : ${seconds}`;
};

const onPlayerReady = () => {
    let interval;
    const durationSec = player.getDuration();

    $(".player__duration-estimate").text(formatTime(durationSec));

    if (typeof interval !== 'undefined') {
        clearInterval(interval);
    }

    interval = setInterval(() => {
        const completedSec = player.getCurrentTime();
        const completedPercent = (completedSec / durationSec) * 100;

        $(".player__playback-button").css({
            left: `${completedPercent}%`
        });

        $(".player__duration-completed").text(formatTime(completedSec));
    }, 1000);
};

const onPlayerStateChange = event => {
    switch (event.data) {
        case 1:
            playerContainer.addClass('active');
            playerContainer.addClass('paused');
            break;
        case 2:
            playerContainer.removeClass('active');
            playerContainer.removeClass('paused');
            break;
    }
};

function onYouTubeIframeAPIReady() {
    player = new YT.Player("yt-player", {
        height: "392",
        width: "662",
        videoID: "U4RDCKR4fLE", 
        events: {
            onReady: onPlayerReady, 
            onStateChange: onPlayerStateChange
        },
        playerVars: {
            controls: 0,
            disablekb: 0,
            showinfo: 0,
            rel: 0,
            autoplay: 0,
            modestbranding: 0
        }
    });
}

eventsInit();

/* Интерактивная карта */

let myMap;

const init = () => {
    myMap = new ymaps.Map("map", {
        center: [55.749331, 37.603365],
        zoom: 15,
        controls: []
    });

    const coords = [
        [55.749331, 37.603365],
    ];

    const myCollection = new ymaps.GeoObjectCollection({}, {
        draggable: false,
        iconLayout: 'default#image',
        iconImageHref: "./img/decor/point.svg",
        iconImageSize: [58, 73],
        iconImageOffset: [-35, -52]
    });

    coords.forEach(coord => {
        myCollection.add(new ymaps.Placemark(coord));
    });

    myMap.geoObjects.add(myCollection);

    myMap.behaviors.disable('scrollZoom');
}

ymaps.ready(init);

/* ops */
const sections = $("section");
const display = $(".maincontent");
const sideMenu = $(".fixed-menu");
const menuItems = sideMenu.find(".fixed-menu__item");

const mobileDetect = new MobileDetect(window.navigator.userAgent);
const isMobile = mobileDetect.mobile();

let inScroll = false;

sections.first().addClass("active");

const countSectionPosition = (sectionEq) => {
    const position = sectionEq * -100;
    
    if (isNaN(position)) {
        console.error("передано не верное значение в countSectionPosition");
        return 0;
    }

    return position;
};

const changeMenuThemeForSection = (sectionEq) => {
    const currentSection = sections.eq(sectionEq);
    const menuTheme = currentSection.attr("data-sidemenu-theme");
    const activeClass = "fixed-menu--shadowed";

    if (menuTheme == "black") {
        sideMenu.addClass(activeClass);
    } else {
        sideMenu.removeClass(activeClass);
    }
};

const resetActiveClassRorItem = (items, itemEq, activeClass) => {
     items.eq(itemEq).addClass(activeClass).siblings().removeClass(activeClass);
};

const performTransition = (sectionEq) => {
    if (inScroll) return; 

    const transitionOver = 1000;
    const mouseInertiaOver = 300;

    inScroll = true;

    const position = countSectionPosition(sectionEq);

    changeMenuThemeForSection(sectionEq);

    display.css({
        transform: `traslateY(${position}%)`,
    });

    resetActiveClassRorItem(sections, sectionEq, "active");

    setTimeout(() => {
        inScroll = false;

        resetActiveClassRorItem(menuItems, sectionEq, "fixed-menu__item--active");

    }, transitionOver + mouseInertiaOver);
};

const viewportScroller = () => {
    const activeSection = sections.filter(".active");
    const nextSection = activeSection.next();
    const prevSection = activeSection.prev();

    return {
        next() {
            if (nextSection.lenght) {
                performTransition(nextSection.index());
            }
        },
        prev() {
            if (prevSection.lenght) {
                performTransition(prevSection.index());
            }
        },
    };
};

$(window).on("wheel", (e) => {
    const deltaY = e.originalEvent.deltaY;
    const scroller = viewportScroller();

    if (deltaY > 0) {
        scroller.next();
    }

    if (deltaY < 0) {
        scroller.prev();
    }
});

$(window).on("keydown", (e) => {
    const tagName = e.target.tagName.toLowerCase();
    const userTypingInInputs = tagName == "input" || tagName == "textarea";
    const scroller = viewportScroller();

    if (userTypingInInputs) return;

    switch (e.keyCode) {
        case 38:
            scroller.next();
            break;
    
        case 40:
            scroller.prev();
            break;
    }
});

$(".wrapper").on("touchmove", (e) => e.preventDefault());

$("[data-scroll-to]").click((e) => {
    e.preventDefault();

    const $this = $(e.currentTarget);
    const target = $this.attr("data-scroll-to");
    const reqSection = $(`[data-section-id=${target}]`);

    performTransition(reqSection.index());
});

// https://hgoebl.github.io/mobile-detect.js/doc/MobileDetect.html

if (isMobile) {
    // https://github.com/mattbryson/TouchSwipe-Jquery-Plugin
    $("body").swipe({
        swipe: function (event, direction) {
            const scroller = viewportScroller();
            let scrollDirection = "";
            
            if (direction == 'up') scrollDirection = "next";
            if (direction == 'down') scrollDirection = "prev";
    
            scroller[scrollDirection]();
        },
    });
};





