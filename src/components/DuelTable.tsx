export const DuelView: React.FC = () => {
  return (
    <div
      className="grid h-screen gap-2
        grid-cols-[100px_minmax(0,2fr)_100px]
        grid-rows-[140px_1fr_50px_1fr_140px] overflow-hidden"
      data-testid="duel-view"
    >
      {/* Row 1: inactive discard / hand / deck */}
      <section className="col-1 row-1"></section>

      <section className="col-2 row-1 relative"></section>

      <section className="col-3 row-1"></section>

      {/* Row 2: inactive board full width */}
      <section className="col-[1/4] row-2 justify-center items-end flex"></section>

      {/* Row 3: center bar */}
      <section className="col-[1/4] w-full px-2 row-3 flex justify-between place-items-center"></section>

      {/* Row 4: active board full width */}
      <section className="col-[1/4] row-4"></section>

      {/* Row 5: active discard / hand / deck */}
      <section className="col-1 row-5"></section>

      <section className="col-2 row-5 relative"></section>

      <section className="col-3 row-5"></section>
    </div>
  );
};
