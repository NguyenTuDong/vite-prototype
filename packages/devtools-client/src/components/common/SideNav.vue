<template>
  <div
    border="r base"
    flex="~ col items-start"
    class="$ui-z-max-override"
    h-full
    of-hidden
  >
    <div sticky top-0 z-1 w-full p1 border="b base">
      <button
        ref="buttonDocking"
        flex="~ items-center justify-center gap-2"
        hover="bg-active"
        text-secondary
        relative
        h-10
        w-full
        select-none
        p2
        :class="['rounded pl2.5']"
      >
        <div i-mdi-tools h-6 w-6 />
        <span text-lg font-600 text-base> DevTools </span>
        <div flex-auto />
        <div i-mdi-dots-vertical />
      </button>
    </div>

    <div
      flex="~ auto col gap-0.5 items-center"
      w-full
      of-x-hidden
      of-y-auto
      p1
      class="no-scrollbar"
    >
      <div>Test Item</div>
      <div flex-auto />
    </div>
  </div>
</template>
