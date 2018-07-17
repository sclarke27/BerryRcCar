package ai.swim.service;

import recon.Form;
import recon.Value;
import swim.api.*;


public class BotStateService extends AbstractService {

  private boolean botInitialized = false;

  @SwimLane("name")
  ValueLane<String> name = valueLane().valueClass(String.class)
  .didSet((n, o) -> {
    if (!botInitialized) {
      System.out.println("Startup bot:" + n);
      initBot();
      botInitialized = true;
    }
  });

  @SwimLane("setName")
  CommandLane<String> setName = commandLane().valueClass(String.class)
    .onCommand(t -> {
      name.set(t);
    });  

  @SwimLane("canDriveForward")
  ValueLane<Boolean> canDriveForward = valueLane().valueClass(Boolean.class);

  @SwimLane("setCanDriveForward")
  CommandLane<Boolean> setCanDriveForward = commandLane().valueClass(Boolean.class)
    .onCommand(t -> {
      canDriveForward.set(t);
    });  
  
  @SwimLane("isDrivingForward")
  ValueLane<Boolean> isDrivingForward = valueLane().valueClass(Boolean.class);

  @SwimLane("setIsDrivingForward")
  CommandLane<Boolean> setIsDrivingForward = commandLane().valueClass(Boolean.class)
    .onCommand(t -> {
      isDrivingForward.set(t);
    });  
 
  @SwimLane("canDriveBackward")
  ValueLane<Boolean> canDriveBackward = valueLane().valueClass(Boolean.class);

  @SwimLane("setCanDriveBackward")
  CommandLane<Boolean> setCanDriveBackward = commandLane().valueClass(Boolean.class)
    .onCommand(t -> {
      canDriveBackward.set(t);
    });  
  
  @SwimLane("isDrivingBackward")
  ValueLane<Boolean> isDrivingBackward = valueLane().valueClass(Boolean.class);

  @SwimLane("setIsDrivingBackward")
  CommandLane<Boolean> setIsDrivingBackward = commandLane().valueClass(Boolean.class)
    .onCommand(t -> {
      isDrivingBackward.set(t);
    });      
      
  private void initBot() {
    isDrivingBackward.set(false);
    isDrivingForward.set(false);
    canDriveForward.set(false);
    canDriveBackward.set(false);

  };
}
