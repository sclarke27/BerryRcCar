package ai.swim.service;

import recon.Form;
import recon.Value;
import swim.api.*;

public class ImageService extends AbstractService {

  private boolean serviceInitialized = false;
  private static final int RAW_IMG_HISTORY_SIZE = 5;

  @SwimLane("name")
  ValueLane<String> name = valueLane().valueClass(String.class)
  .didSet((n, o) -> {
    if (!serviceInitialized) {
      System.out.println("Startup image service for :" + n);
      serviceInitialized = true;
      // TODO: maybe do other stuff on startup?
    }
  });

  @SwimLane("setName")
  CommandLane<String> setName = commandLane().valueClass(String.class)
    .onCommand(t -> {
      name.set(t);
    });  

  @SwimLane("rawImage")
  ValueLane<String> rawImage = valueLane().valueClass(String.class);

  @SwimLane("rawImageHistory")
  MapLane<Long, String> rawImageHistory = mapLane().keyClass(Long.class).valueClass(String.class)
    .didUpdate((key, newValue, oldValue) -> {
      if (this.rawImageHistory.size() > RAW_IMG_HISTORY_SIZE) {
        this.rawImageHistory.drop(this.rawImageHistory.size() - RAW_IMG_HISTORY_SIZE);
      }
    })
    .isTransient(true);

  @SwimLane("updateRawImage")
  CommandLane<String> updateRawImage = commandLane().valueClass(String.class)
    .onCommand(t -> {
      rawImage.set(t);
    //   final long now = System.currentTimeMillis();
    //   rawImageHistory.put(now, t);

    });  

}