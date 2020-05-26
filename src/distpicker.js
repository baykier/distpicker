import $ from 'jquery';
import DEFAULTS from './defaults';
import  DISTRICTS from './dist';
import { EVENT_CHANGE } from './constants';



const DEFAULT_CODE = 410000000000;//河南省


const CITY = 'city';
const COUNTRY = 'country';
const DISTRICT = 'district';
const VALILAGE = 'valilage';

export default class Distpicker {
  constructor(element, options) {
    this.$element = $(element);
    this.options = $.extend({}, DEFAULTS, $.isPlainObject(options) && options);
    this.placeholders = $.extend({}, DEFAULTS);
    this.ready = false;
    this.init();
  }

  init() {
    const { options } = this;
    const $selects = this.$element.find('select');
    const { length } = $selects;
    const data = {};

    $selects.each((i, select) => $.extend(data, $(select).data()));

    $.each([ CITY, COUNTRY,DISTRICT,VALILAGE], (i, type) => {
      if (data[type]) {
        options[type] = data[type];
        this[`$${type}`] = $selects.filter(`[data-${type}]`);
      } else {
        this[`$${type}`] = length > i ? $selects.eq(i) : null;
      }
    });

    this.bind();

    // Reset all the selects (after event binding)
    this.reset();
    this.ready = true;
  }

  bind() {
    if (this.$city) {
      this.$city.on(EVENT_CHANGE, (this.onChangeCity = $.proxy(() => {
        this.output(COUNTRY);
        this.output(DISTRICT, true);
        this.output(VALILAGE, true);
      }, this)));
    }

    if (this.$country) {
      this.$country.on(
        EVENT_CHANGE,
        (this.onChangeCountry = $.proxy(() => {
          this.output(DISTRICT, true);
          this.output(VALILAGE, true)
        }, this)),
      );
    }
    if (this.$district) {
      this.$district.on(
        EVENT_CHANGE,
        (this.onChangeDistrict = $.proxy(() => this.output(VALILAGE, true), this)),
      );
    }
  }

  unbind() {
    if (this.$city) {
      this.$city.off(EVENT_CHANGE, this.onChangeCity);
    }

    if (this.$country) {
      this.$country.off(EVENT_CHANGE, this.onChangeCountry);
    }
    if (this.$district) {
      this.$country.off(EVENT_CHANGE, this.onChangeDistrict);
    }
  }

  output(type, triggerEvent = false) {
    console.log(type);
    const { options, placeholders } = this;
    const $select = this[`$${type}`];

    if (!$select || !$select.length) {
      return;
    }

    let code;

    switch (type) {
      case CITY:
        code = DEFAULT_CODE;
        break;

      case COUNTRY:
        code = this.$country && (this.$country.find(':selected').data('code') || '');
        break;

      case DISTRICT:
        code = this.$district && (this.$district.find(':selected').data('code') || '');
        break;

      case VALILAGE:
        code = this.$valilage && (this.$valilage.find(':selected').data('code') || '');
        break;
    }

    const districts = this.getDistricts(code);
    const value = options[type];
    const data = [];
    let matched = false;

    if ($.isPlainObject(districts)) {
      $.each(districts, (i, name) => {
        const selected = name === value || i === String(value);

        if (selected) {
          matched = true;
        }

        data.push({
          name,
          selected,
          code: i,
          value: options.valueType === 'name' ? name : i,
        });
      });
    }

    if (!matched) {
      const autoselect = options.autoselect || options.autoSelect;

      if (data.length && ((type === CITY && autoselect > 0)
        || (type === COUNTRY && autoselect > 1)
        || (type === DISTRICT && autoselect > 2)
        || (type === VALILAGE && autoselect > 3)
        )) {
        data[0].selected = true;
      }

      // Save the unmatched value as a placeholder at the first output
      if (!this.ready && value) {
        placeholders[type] = value;
      }
    }

    // Add placeholder option
    if (options.placeholder) {
      data.unshift({
        code: '',
        name: placeholders[type],
        value: '',
        selected: false,
      });
    }

    if (data.length) {
      $select.html(this.getList(data));
    } else {
      $select.empty();
    }

    if (triggerEvent) {
      $select.trigger(EVENT_CHANGE);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  getList(data) {
    const list = [];

    $.each(data, (i, n) => {
      const attrs = [
        `data-code="${n.code}"`,
        `data-text="${n.name}"`,
        `value="${n.value}"`,
      ];

      if (n.selected) {
        attrs.push('selected');
      }

      list.push(`<option ${attrs.join(' ')}>${n.name}</option>`);
    });

    return list.join('');
  }

  // eslint-disable-next-line class-methods-use-this
  getDistricts(code = DEFAULT_CODE) {
    return DISTRICTS[code] || null;
  }

  reset(deep) {
    if (!deep) {

      this.output(CITY);
      this.output(COUNTRY);
      this.output(DISTRICT);
      this.output(VALILAGE);
    } else if (this.$city) {
      this.$city.find(':first').prop('selected', true).end().trigger(EVENT_CHANGE);
    }
  }

  destroy() {
    this.unbind();
  }

  static setDefaults(options) {
    $.extend(DEFAULTS, $.isPlainObject(options) && options);
  }
}
