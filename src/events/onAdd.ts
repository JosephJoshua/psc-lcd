import { ScreenNameValues } from '@/types/screenNames';
import { Subject } from 'rxjs';

const subject = new Subject<ScreenNameValues>();
const subscribedScreens = new Set<ScreenNameValues>();

const onAdd = {
  trigger: (screen: ScreenNameValues) => subject.next(screen),
  subscribe: (screen: ScreenNameValues, callback: () => void) => {
    if (subscribedScreens.has(screen)) return;
    subscribedScreens.add(screen);

    const subscription = subject.subscribe((value) => {
      if (screen === value) callback();
    });

    const unsubscribe = () => {
      subscribedScreens.delete(screen);
      return subscription.unsubscribe();
    };

    return {
      ...subscription,
      unsubscribe,
    };
  },
};

export default onAdd;
