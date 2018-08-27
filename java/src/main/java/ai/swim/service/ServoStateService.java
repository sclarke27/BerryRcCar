package ai.swim.service;

import recon.Value;
import swim.api.*;
import swim.concurrent.TimerRef;

public class ServoStateService extends AbstractService {

  @SwimLane("name")
  ValueLane<String> name = valueLane().valueClass(String.class)
  .didSet((n, o) -> {
      System.out.println("Startup servo: " + n);
    }
  });

  @SwimLane("setName")
  CommandLane<String> setName = commandLane().valueClass(String.class)
    .onCommand(t -> {
      name.set(t);
    });  

  @SwimLane("current")
  ValueLane<Integer> current = valueLane().valueClass(Integer.class)
    .isTransient(true);

  @SwimLane("setCurrent")
  CommandLane<Integer> setCurrent = commandLane().valueClass(Integer.class)
    .onCommand(i -> {
      current.set(i);
    });

}