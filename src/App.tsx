import { useLed } from './hooks/useLed';
import { Bulb } from './components/Bulb';
import { PowerButton } from './components/PowerButton';
import { StatusBar } from './components/StatusBar';
import { Toasts } from './components/Toasts';

// Корневой компонент: собирает интерфейс, вся логика — в useLed
export default function App() {
  const led = useLed();

  return (
    <div className={`app ${led.isOn ? 'app--lit' : ''}`}>
      <header className="app__header">
        <h1 className="app__title">LED Controller</h1>
      </header>

      <main className="app__main">
        <section className="stage">
          <Bulb
            isOn={led.isOn}
            isLoading={led.isLoading}
            disabled={led.isToggling || led.isOn === null}
            onToggle={led.toggle}
          />
          <PowerButton
            isOn={led.isOn}
            isPending={led.isToggling}
            disabled={led.isLoading}
            onToggle={led.toggle}
          />
          <StatusBar
            isOn={led.isOn}
            isLoading={led.isLoading}
            connection={led.connection}
            lastUpdated={led.lastUpdated}
            isRefreshing={led.isRefreshing}
            onRefresh={led.refresh}
          />
        </section>

        {/*<aside className="side">*/}
        {/*  <AutoOffTimer*/}
        {/*    isOn={led.isOn}*/}
        {/*    autoOff={led.autoOff}*/}
        {/*    onStart={led.startAutoOff}*/}
        {/*    onCancel={led.cancelAutoOff}*/}
        {/*  />*/}
        {/*  <ActionLog entries={led.log} />*/}
        {/*</aside>*/}
      </main>

      <Toasts toasts={led.toasts} onDismiss={led.dismissToast} />
    </div>
  );
}
