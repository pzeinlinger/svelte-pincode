<script>
  /**
   * @typedef {string[]} Code
   * @event {{ code: Code; value: string; }} complete
   */

  /** @type {Code} */
  export let code = [];

  export let value = "";

  /** @type {"alphanumeric" | "numeric"} */
  export let type = "alphanumeric";

  /** `true` if all inputs have a value */
  export let complete = false;

  export let selectTextOnFocus = false;

  /** @type {() => void} */
  export const focusFirstInput = () => {
    ref.querySelector("input").focus();
  };

  /** @type {() => void} */
  export const focusNextEmptyInput = () => {
    for (const input of ref.querySelectorAll("input")) {
      if (input.value.length === 0) {
        input.focus();
        break;
      }
    }
  };

  /** @type {() => void} */
  export const focusLastInput = () => {
    ref.querySelector("input:last-of-type").focus();
  };

  import { setContext, createEventDispatcher, tick, onMount } from "svelte";
  import { writable, derived } from "svelte/store";

  const dispatch = createEventDispatcher();
  const _ids = writable([]);
  const _valuesById = derived(_ids, (_) => {
    return _.reduce((a, c) => ({ ...a, [c.id]: c.value }), {});
  });
  const _type = writable(type);
  const _selectTextOnFocus = writable(selectTextOnFocus);

  let ref = null;

  function setCode() {
    code = $_ids.map((_) => _.value || "");
  }

  function focusNextInput(idx) {
    const inputs = ref.querySelectorAll("input");
    const nextInput = inputs[idx + 1];

    if (nextInput) nextInput.focus();
  }

  setContext("Pincode", {
    _type,
    _selectTextOnFocus,
    _valuesById,
    focusNextInput: (id) => {
      const idx = $_ids.map((_) => _.id).indexOf(id);

      focusNextInput(idx);
    },
    add: (id, value) => {
      let _code = [...code];

      _ids.update((_) => {
        if (code[_.length] === undefined) {
          _code[_.length] = value;
        } else {
          _code[_.length] = _code[_.length] || value;
        }

        return [
          ..._,
          {
            id,
            value: code[_.length] || value,
          },
        ];
      });

      code = _code;
    },
    remove: (id) => {
      _ids.update((_) => _.filter((_id) => _id.id !== id));
      setCode();
    },
    update: async (id, input_value) => {
      const idx = $_ids.map((_) => _.id).indexOf(id);

      _ids.update((_) => {
        return _.map((_id, i) => {
          if (i === idx) return { ..._id, value: input_value };
          return _id;
        });
      });

      setCode();
      focusNextInput(idx);
    },
    clear: (id) => {
      const idx = $_ids.map((_) => _.id).indexOf(id);

      if (!$_ids[idx].value) {
        const inputs = ref.querySelectorAll("input");
        const prevInput = inputs[idx - 1];

        if (prevInput) {
          prevInput.focus();
          prevInput.select();
        }
      }

      _ids.update((_) => {
        return _.map((_id, i) => {
          if (i === idx) return { ..._id, value: "" };
          return _id;
        });
      });

      setCode();
    },
  });

  function handleInput(e) {
    let input = e.data || e.target.value;
    if (!input) return;
    input = input.trim();
    if (input.length === 1) return;
    if (input.length !== $_ids.length) return;
    code = input.split("");
  }

  $: _type.set(type);
  $: _selectTextOnFocus.set(selectTextOnFocus);
  $: value = code.join("");
  $: complete = code.filter(Boolean).length === $_ids.length;
  $: complete && dispatch("complete", { code, value });
  $: if (code) {
    _ids.update((_) => {
      return _.map((_id, i) => ({ ..._id, value: code[i] }));
    });
  }

  $: if (code.length === 0) {
    _ids.update((_) => _.map((_id) => ({ ..._id, value: "" })));
  }
</script>

<div data-pincode bind:this="{ref}" {...$$restProps} on:input="{handleInput}">
  <slot />
</div>

<style>
  [data-pincode] {
    display: inline-flex;
    border: 1px solid #e0e0e0;
  }
</style>
