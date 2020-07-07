class GamePhraseWriting extends HTMLElement {
  constructor() {
    super();
    this.level = 0;
    this.gooLevel = 0;
    this.data = JSON.parse(this.getAttribute("data-game"));
    this.attachShadow({ mode: "open" });
    this.baseClass = "c-gamePhrase";
    this.btnValidate = this.createElement(
      "button",
      {
        class: `${this.baseClass}_btnValidate`
      },
      ["send"]
    );
    this.bodyGame = this.createElement("div", {
      class: `${this.baseClass}_body`
    });
    this.watchLevel = this.createElement("p", {
      class: `${this.baseClass}_header-level`
    });
    this.initGame();
  }

  initGame() {
    this.addStyles();
    this.createElementsGame();
  }

  static get observedAttributes() {
    return ["level"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    this.watchLevel.innerText = `Level: ${this.level + 1}`;
  }

  addStyles() {
    const style = `
      <style>
        :host{
          display:grid;
          grid-template:3rem 1fr 2rem / 1fr;
          box-shadow: 0 0 1px black;
          padding:3px;
          width:100%;
          margin:0 auto;
          max-width:720px;
          min-height:150px;
        }
        :host > * {box-sizing: border-box}
        .${this.baseClass}_header, .${this.baseClass}_body, .${
      this.baseClass
    }_footer, .${this.baseClass}_card{
          box-shadow: 0 0 1px black;
        }
        .${this.baseClass}_body{
          display: grid;
          grid-template: max-content / repeat(auto-fit, minmax(250px,250px));
          justify-content: center;
          justify-items: center;
          padding:.5rem;
          gap:20px;
        }
        .${this.baseClass}_header {
          padding:0 1rem;
        }
        .${this.baseClass}_header-level{
          font-weight: bold
        }
        .${this.baseClass}_footer {
          display:flex;
          justify-content:center;
          align-items:center
        }
        .${this.baseClass}_btnValidate {
          cursor:pointer
        }
        .${this.baseClass}_card{
          display:grid;
          width:100%;
          padding:5px;
          grid-template: 1fr max-content/1fr;
          justify-content: center;
          justify-items:center;
        }
        .${this.baseClass}_card.is-good{
          box-shadow:0 0 4px green;
        }
        .${this.baseClass}_card.is-wrong{
          box-shadow:0 0 4px red;
        }
        .${this.baseClass}_card-input{
          display:inline;
          position:relative;
          text-align:center;
          margin: 0 4px 0 0;
          padding: 0 15px;
          border-bottom: 1px dashed black;
        }
        .${this.baseClass}_card-img{
          display:block;
          width:100%;
          max-width:100%
          object-fit:cover
        }
      </style>
    `;
    this.shadowRoot.innerHTML = style;
  }

  createElement(elem, attributes, children) {
    const newElem = document.createElement(elem);
    if (children !== undefined) {
      children.forEach(el => {
        if (el.nodeType) {
          if (el.nodeType === 1 || el.nodeType === 11) newElem.appendChild(el);
        } else {
          newElem.innerHTML += el;
        }
      });
    }
    this.addAttributes(newElem, attributes);
    return newElem;
  }

  addAttributes(elem, attrObj) {
    for (const attr in attrObj) {
      if (Object.prototype.hasOwnProperty.call(attrObj, attr))
        elem.setAttribute(attr, attrObj[attr]);
    }
    return elem;
  }

  createElementsGame() {
    const headerGame = this.createElement(
      "div",
      {
        class: `${this.baseClass}_header`
      },
      [this.watchLevel]
    );
    const footerGame = this.createElement(
      "div",
      {
        class: `${this.baseClass}_footer`
      },
      [this.btnValidate]
    );

    this.bodyGame.appendChild(this.createCards());
    this.shadowRoot.appendChild(headerGame);
    this.shadowRoot.appendChild(this.bodyGame);
    this.shadowRoot.appendChild(footerGame);
  }

  createCards() {
    const fragment = new DocumentFragment();
    this.data[this.level].map((elem, idx) => {
      let phrase = this.createPhrase(elem.phrase, elem.type, elem.options);
      const cardGameImage = this.createElement("img", {
        class: `${this.baseClass}_card-img`,
        src: elem.url
      });

      const cardPhrase = this.createElement(
        "p",
        {
          class: `${this.baseClass}_card-phrase`
        },
        [phrase]
      );

      const cardGame = this.createElement(
        "div",
        {
          class: `${this.baseClass}_card`
        },
        [cardGameImage, cardPhrase]
      );

      fragment.appendChild(cardGame);
      return true;
    });
    return fragment;
  }

  createPhrase(phrase, type, options) {
    const fragment = new DocumentFragment();
    const arrPhrase = phrase.split(" ");
    const optionComplete = this.selectOption(type, options);

    arrPhrase.map((item, idx) => {
      switch (item) {
        case "|":
          fragment.appendChild(optionComplete);
          break;

        default:
          const textNode = document.createTextNode(item);
          fragment.appendChild(textNode);
          break;
      }
      const space = document.createTextNode(" ");
      fragment.appendChild(space);
      return true;
    });

    return fragment;
  }

  selectOption(typeOption, options) {
    const fragment = new DocumentFragment();
    let elemValidate;
    switch (typeOption) {
      case "input":
        elemValidate = this.createElement("span", {
          class: `${this.baseClass}_card-input`,
          contenteditable: true,
          "data-type": typeOption
        });
        break;
      case "select":
        let optionDefault = new Option("", 0);
        elemValidate = this.createElement("select", {
          class: `${this.baseClass}_card-select`,
          "data-type": typeOption
        });
        this.addAttributes(optionDefault, {
          disabled: true,
          selected: true
        });
        elemValidate.add(optionDefault);

        options.map((optionTxt, idx) => {
          let newOption = new Option(optionTxt, optionTxt);
          elemValidate.add(newOption);
          return true;
        });
        break;
      default:
        break;
    }
    fragment.appendChild(elemValidate);
    return fragment;
  }

  validateLevel(e) {
    const elemToValidate = this.shadowRoot.querySelectorAll(
      `.${this.baseClass}_card`
    );
    elemToValidate.forEach((card, idx) => {
      const cards = card.querySelectorAll(
        `.${this.baseClass}_card [data-type]`
      );
      let correctAnswer = this.data[this.level][idx].answer;
      cards.forEach(validate => {
        let dataType = validate.getAttribute("data-type");
        let value;
        switch (dataType) {
          case "input":
            value = validate.textContent;
            break;
          case "select":
            value = validate.value;
            break;
          default:
            value = "";
            break;
        }
        if (value === correctAnswer) {
          card.classList.remove("is-wrong");
          card.classList.add("is-good");
          this.gooLevel++;
        } else {
          card.classList.remove("is-good");
          card.classList.add("is-wrong");
        }
        this.nextLevel(elemToValidate);
      });
    });
  }

  nextLevel(elemToValidate) {
    if (this.gooLevel === elemToValidate.length) {
      this.level++;
      if (this.level === Object.keys(this.data).length) {
        console.log("!!!!finish¡¡¡¡¡¡");
        return true;
      } else {
        this.setAttribute("level", `${this.level}`);
        this.bodyGame.innerHTML = "";
        this.gooLevel = 0;
        this.bodyGame.appendChild(this.createCards());
      }
    }
  }

  connectedCallback() {
    this.btnValidate.addEventListener(
      "click",
      this.validateLevel.bind(this),
      false
    );
    if (!this.hasAttribute("level")) {
      this.setAttribute("level", 1);
    }
  }

  disconnectedCallback() {
    this.btnValidate.removeEventListener(
      "click",
      this.validateLevel.bind(this),
      false
    );
  }
}

if (!customElements.get("game-phrase-writing")) {
  customElements.define("game-phrase-writing", GamePhraseWriting);
}
