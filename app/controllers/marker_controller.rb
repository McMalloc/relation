class MarkerController < ApplicationController
  def fetch
    @marker_by_id = Marker.where("id = " + params[:id])
    render json: @marker_by_id.as_json(
                    only: [ :id, 
                            :pass_id, 
                            :code,
                            :position
                          ]
                  )
  end
  # fetch Marker via Passes Marker association Pass.find(:id).marker
end
