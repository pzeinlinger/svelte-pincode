<script>
  /** @type {any} */
  export let value = "";
  export let id = "input" + Math.random().toString(36);
  export let ref = null;

  import { getContext, onMount } from "svelte";

  let type;
  let selectTextOnFocus;

  const ctx = getContext("Pincode");
  const unsubscribeType = ctx._type.subscribe((_type) => {
    type = _type;
  });
  const unsubscribeSelectTextOnFocus = ctx._selectTextOnFocus.subscribe((_selectTextOnFocus) => {
    selectTextOnFocus = _selectTextOnFocus;
  });

  let unsubscribe = undefined;

  onMount(() => {
    ctx.add(id, value);

    unsubscribe = ctx._valuesById.subscribe((_) => {
      value = _[id] || "";
    });

    return () => {
      ctx.remove(id);
      unsubscribe();
      unsubscribeType();
      unsubscribeSelectTextOnFocus();
    };
  });
</script>

<input
  bind:this="{ref}"
  {...$$restProps}
  type="{type === 'numeric' ? 'number' : 'text'}"
  inputmode="{type === 'numeric' ? 'numeric' : 'text'}"
  pattern="{type === 'numeric' ? '[0-9]{1}' : '^[a-zA-Z0-9]$'}"
  maxlength="1"
  value="{value}"
  on:focus
  on:focus="{() => {
    if (selectTextOnFocus) ref.select();
  }}"
  on:blur
  on:keydown
  on:keydown="{(e) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      return ctx.clear(id);
    }

    if (e.key !== 'Tab') {
      e.preventDefault();

      if (type === 'numeric' && /^[0-9]$/.test(e.key)) {
        ctx.update(id, e.key);
      }

      if (type === 'alphanumeric' && /^[a-zA-Z0-9]$/.test(e.key)) {
        ctx.update(id, e.key);
      }
    }
  }}"
/>
