class MarkersController < ApplicationController
  def fetch
    #params[:task_id] == "all" ? @marker_by_id = Marker.all : @marker_by_id = Marker.where("id = " + params[:task_id])
    @marker_by_id = Marker.all
    render json: @marker_by_id, root: false
  end
  
  def fetchCounts
    
  end
  # fetch Marker via Passes Marker association Pass.find(:id).marker
end
