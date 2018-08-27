package ai.swim.service;

import recon.Value;
import swim.api.*;
import swim.concurrent.TimerRef;

public class SensorService extends AbstractService {

  private static final int SHORT_HISTORY_SIZE = 20;


  /**
   * Use a value lane to store a single data item, the class type of the item needs to be specified
   * In this case store value lane is of type Integer
   *
   * didSet is called when the ValueLane gets updated with a new value
   */
  @SwimLane("latest")
  ValueLane<Integer> latest = valueLane().valueClass(Integer.class)
    .isTransient(true);

  /**
   * Use a map lane to store a keyed collection of data items of a specific type. The class type of the key and the
   * data item needs to be specified
   *
   * In this case store the key to the map lane is of type Long and the value of the map lane is of type Integer
   *
   * didUpdate is called when the MapLane gets updated
   */
  @SwimLane("history")
  MapLane<Long, Integer> history = mapLane().keyClass(Long.class).valueClass(Integer.class)
    .didUpdate((key, newValue, oldValue) -> {
      if (this.history.size() > SHORT_HISTORY_SIZE) {
        this.history.drop(this.history.size() - SHORT_HISTORY_SIZE);
      }
    })
    .isTransient(true);
  
  /**
   * Use a command lane to ingest data from an external client, the class type of the data item needs to be specified
   * In this case the command lane is of type Integer
   */
  @SwimLane("addLatest")
  CommandLane<Integer> addLatest = commandLane().valueClass(Integer.class)
    .onCommand(i -> {
      latest.set(i);
      history.put(System.currentTimeMillis(), i);
    });


}