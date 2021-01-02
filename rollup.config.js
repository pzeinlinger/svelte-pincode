import resolve from "@rollup/plugin-node-resolve";
import svelte from "rollup-plugin-svelte";
import svelteReadme from "svelte-readme";
import pkg from "./package.json";

export default () => {
  if (!process.env.BUNDLE) return svelteReadme({
    style: `
    [data-pincode], [data-pincode] ~ div {
      margin-bottom: 16px;
    }

    /**
      * GitHub Primer button CSS
      * https://primer.style/css/components/buttons
      **/
    .code-fence button {
      font-family: inherit;
      text-transform: none;
      position: relative;
      display: inline-block;
      padding: 5px 16px;
      font-size: 14px;
      font-weight: 500;
      line-height: 20px;
      white-space: nowrap;
      vertical-align: middle;
      cursor: pointer;
      user-select: none;
      border: 1px solid;
      border-radius: 6px;
      appearance: none;
      color: #24292e;
      background-color: #fafbfc;
      border-color: rgba(27,31,35,0.15);
      box-shadow: 0 1px 0 rgba(27,31,35,0.04), inset 0 1px 0 rgba(255,255,255,0.25);
      transition: background-color 0.2s cubic-bezier(0.3, 0, 0.5, 1);
    }

    .complete {
      font-weight: 700;
    }

    .success {
      color: #24a148;
    }

    .error {
      color: #da1e28;
    }
   `
  });

  return ["es", "umd"].map((format) => {
    const UMD = format === "umd";

    return {
      input: pkg.svelte,
      output: {
        format,
        file: UMD ? pkg.main : pkg.module,
        name: UMD ? pkg.name : undefined,
        exports: "named",
      },
      plugins: [svelte({ emitCss: false }), resolve()],
    };
  });
};