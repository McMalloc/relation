class PassController < ApplicationController
  def fetch
    @all_passes_for_prototype = Pass.where("prototype_id = " + params[:prototype_id])
    render json: @all_passes_for_prototype.as_json(only: [:id, :task_id, :participant_id, :tasktime, :satisfaction])
  end
end
