import { VelocityService } from './velocity.service';
import { output } from './output';
import { input } from './input';

describe('VelocityService', () => {
  let velocityService: VelocityService;

  beforeEach(() => {
    velocityService = new VelocityService();
  });

  describe('validateAllInputs', () => {
    it('should validate the original input and return the originally provided output', () => {
      const validatedOutput = JSON.stringify(velocityService.validateAllInputs(input));
      const targetOutput = JSON.stringify(output);

      expect(validatedOutput).toEqual(targetOutput);
    });
  });

  describe('validateLoad', () => {
    let mockInput;
    beforeEach(() => {
      mockInput = {"id":"11006","customer_id":"613","load_amount":"$3946.62","time":"2000-02-03T23:09:14Z"};
    });

    it('should return undefined if id + customer exist in outputPretendTable', () => {
      velocityService.outputPretendTable = [
        {"id":"11006","customer_id":"613","accepted": true}
      ];

      expect(velocityService.validateLoad(mockInput)).toBeUndefined();
    });

    it('should add outputLine to outputPretendTable', () => {
      velocityService.validateLoad(mockInput);
      expect(velocityService.outputPretendTable[0]).toEqual({ id: "11006", customer_id: "613", accepted: true });
    });

    it('should add inputLine to allAttemptedTransactions', () => {
      velocityService.validateLoad(mockInput);
      expect(velocityService.allAttemptedTransactions[0])
        .toEqual({ ...mockInput, accepted: true });
    });

    it('should return accepted true when load_amount and transaction is valid', () => {
      expect(velocityService.validateLoad(mockInput)).toEqual({
        id: mockInput.id, customer_id: mockInput.customer_id, accepted: true
      });
    });

    it('should return output with accepted false if load_amount is over 5000', () => {
      expect(velocityService.validateLoad(
        {"id":"11006","customer_id":"613","load_amount":"$5046.62","time":"2000-02-03T23:09:14Z"}
      ))
      .toEqual({
        id: "11006", customer_id: "613", accepted: false
      });
    });

    it('should return output with accepted false if > 3 transctions in 1 day', () => {
      velocityService.validateLoad(
        {"id":"11000","customer_id":"613","load_amount":"$446.62","time":"2000-02-03T23:09:14Z"}
      );
      velocityService.validateLoad(
        {"id":"11001","customer_id":"613","load_amount":"$46.62","time":"2000-02-03T23:09:14Z"}
      );
      velocityService.validateLoad(
        {"id":"11002","customer_id":"613","load_amount":"$46.62","time":"2000-02-03T23:09:14Z"}
      );

      expect(velocityService.validateLoad(
        {"id":"11003","customer_id":"613","load_amount":"$46.62","time":"2000-02-03T23:09:14Z"}
      ))
      .toEqual({
        id: "11003", customer_id: "613", accepted: false
      });
    });

    it('should return output with accepted false when > 5000 in 1 day', () => {
      velocityService.validateLoad(
        {"id":"11000","customer_id":"613","load_amount":"$4000","time":"2000-02-03T23:09:14Z"}
      );

      expect(velocityService.validateLoad(
        {"id":"11001","customer_id":"613","load_amount":"$1100","time":"2000-02-03T23:09:14Z"}
      ))
      .toEqual({
        id: "11001", customer_id: "613", accepted: false
      });
    });

    it('should return output with accepted true when < 5000 in 1 day in multiple transactions', () => {
      velocityService.validateLoad(
        {"id":"11000","customer_id":"613","load_amount":"$4000","time":"2000-02-03T23:09:14Z"}
      );
      velocityService.validateLoad(
        {"id":"11001","customer_id":"613","load_amount":"$1200","time":"2000-02-03T23:10:14Z"}
      );

      expect(velocityService.validateLoad(
        {"id":"11002","customer_id":"613","load_amount":"$500","time":"2000-02-03T23:11:14Z"}
      ))
      .toEqual({
        id: "11002", customer_id: "613", accepted: true
      });
    });

    it('should return output with accepted false when > 20000 in 1 week', () => {
      velocityService.validateLoad(
        {"id":"11000","customer_id":"613","load_amount":"$4500","time":"2018-10-23T23:09:14Z"}
      );
      velocityService.validateLoad(
        {"id":"11001","customer_id":"613","load_amount":"$4500","time":"2018-10-24T23:09:14Z"}
      );
      velocityService.validateLoad(
        {"id":"11002","customer_id":"613","load_amount":"$4500","time":"2018-10-25T23:09:14Z"}
      );
      velocityService.validateLoad(
        {"id":"11003","customer_id":"613","load_amount":"$4500","time":"2018-10-26T23:09:14Z"}
      );

      expect(velocityService.validateLoad(
        {"id":"11004","customer_id":"613","load_amount":"$4500","time":"2018-10-27T23:09:14Z"}
      ))
      .toEqual({
        id: "11004", customer_id: "613", accepted: false
      });
    });
  });

  describe('isInDay', () => {
    it('should return true for times in the same day', () => {
      expect(velocityService.isInDay('2000-02-03T22:07:52Z', '2000-02-03T23:09:14Z')).toEqual(true);
    });

    it('should return false for times NOT in the same day', () => {
      expect(velocityService.isInDay('2000-02-03T23:09:14Z', '2000-02-04T00:10:36Z')).toEqual(false);
    });
  });

  describe('isInWeek', () => {
    it('should return true for dates in the same week', () => {
      expect(velocityService.isInWeek('2018-01-01', '2018-01-01')).toEqual(true);
    });

    it('should return true for dates in the same week', () => {
      expect(velocityService.isInWeek('2000-02-04T00:10:36Z', '2000-02-05T01:11:58Z')).toEqual(true);
    });

    it('should return true for dates in the same week', () => {
      expect(velocityService.isInWeek('2018-10-22', '2018-10-28')).toEqual(true);
    });

    it('should return false for dates not in the same week', () => {
      expect(velocityService.isInWeek('2018-10-22', '2018-10-29')).toEqual(false);
    });
  })

});